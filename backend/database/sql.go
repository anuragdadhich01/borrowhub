package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"borrowhub/config"
	
	_ "github.com/lib/pq"           // PostgreSQL driver
	_ "github.com/go-sql-driver/mysql" // MySQL driver  
	_ "github.com/mattn/go-sqlite3"  // SQLite driver
)

// SQLDatabase implements the Database interface using SQL databases
type SQLDatabase struct {
	db     *sql.DB
	dbType string
	config *config.DatabaseConfig
}

// NewSQLDatabase creates a new SQL database instance
func NewSQLDatabase(cfg *config.DatabaseConfig) *SQLDatabase {
	return &SQLDatabase{
		config: cfg,
		dbType: cfg.Type,
	}
}

// Connect establishes database connection
func (d *SQLDatabase) Connect(ctx context.Context) error {
	dsn := d.config.GetDSN()
	if dsn == "" {
		return fmt.Errorf("invalid database configuration")
	}

	var err error
	driverName := d.dbType
	if d.dbType == "sqlite" {
		driverName = "sqlite3"
	}
	
	d.db, err = sql.Open(driverName, dsn)
	if err != nil {
		return fmt.Errorf("failed to open database connection: %w", err)
	}

	// Configure connection pool
	d.db.SetMaxOpenConns(d.config.MaxOpenConns)
	d.db.SetMaxIdleConns(d.config.MaxIdleConns)
	d.db.SetConnMaxLifetime(time.Duration(d.config.ConnMaxLifetime) * time.Second)

	// Test connection
	if err := d.db.PingContext(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	return nil
}

// Close closes the database connection
func (d *SQLDatabase) Close() error {
	if d.db != nil {
		return d.db.Close()
	}
	return nil
}

// Ping tests the database connection
func (d *SQLDatabase) Ping(ctx context.Context) error {
	if d.db == nil {
		return fmt.Errorf("database not connected")
	}
	return d.db.PingContext(ctx)
}

// Migrate runs database migrations
func (d *SQLDatabase) Migrate(ctx context.Context) error {
	// First, create migrations table if it doesn't exist
	createMigrationTable := `
		CREATE TABLE IF NOT EXISTS migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			version INTEGER NOT NULL UNIQUE,
			name VARCHAR(255) NOT NULL,
			applied BOOLEAN NOT NULL DEFAULT FALSE,
			applied_at TIMESTAMP
		)`
	
	if d.dbType == "postgres" {
		createMigrationTable = `
			CREATE TABLE IF NOT EXISTS migrations (
				id SERIAL PRIMARY KEY,
				version INTEGER NOT NULL UNIQUE,
				name VARCHAR(255) NOT NULL,
				applied BOOLEAN NOT NULL DEFAULT FALSE,
				applied_at TIMESTAMP
			)`
	} else if d.dbType == "mysql" {
		createMigrationTable = `
			CREATE TABLE IF NOT EXISTS migrations (
				id INT AUTO_INCREMENT PRIMARY KEY,
				version INTEGER NOT NULL UNIQUE,
				name VARCHAR(255) NOT NULL,
				applied BOOLEAN NOT NULL DEFAULT FALSE,
				applied_at TIMESTAMP
			)`
	}
	
	if _, err := d.db.ExecContext(ctx, createMigrationTable); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Run migrations (simplified - in production you'd read from files)
	migrations := []struct {
		version int
		name    string
		sql     string
	}{
		{1, "initial_schema", d.getInitialSchemaMigration()},
		{2, "additional_tables", d.getAdditionalTablesMigration()},
	}

	for _, migration := range migrations {
		applied, err := d.isMigrationApplied(ctx, migration.version)
		if err != nil {
			return fmt.Errorf("failed to check migration %d: %w", migration.version, err)
		}

		if !applied {
			if err := d.runMigration(ctx, migration.version, migration.name, migration.sql); err != nil {
				return fmt.Errorf("failed to run migration %d: %w", migration.version, err)
			}
		}
	}

	return nil
}

// GetMigrationVersion returns the latest applied migration version
func (d *SQLDatabase) GetMigrationVersion(ctx context.Context) (int, error) {
	var version int
	err := d.db.QueryRowContext(ctx, 
		"SELECT COALESCE(MAX(version), 0) FROM migrations WHERE applied = TRUE").Scan(&version)
	if err != nil {
		return 0, err
	}
	return version, nil
}

// SetMigrationVersion marks a migration as applied
func (d *SQLDatabase) SetMigrationVersion(ctx context.Context, version int) error {
	_, err := d.db.ExecContext(ctx,
		"UPDATE migrations SET applied = TRUE, applied_at = CURRENT_TIMESTAMP WHERE version = ?",
		version)
	return err
}

// User operations
func (d *SQLDatabase) CreateUser(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (id, username, email, password_hash, first_name, last_name, 
			phone, address, role, status, avatar, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	
	_, err := d.db.ExecContext(ctx, query,
		user.ID, user.Username, user.Email, user.Password, user.FirstName, user.LastName,
		user.Phone, user.Address, user.Role, user.Status, user.Avatar, 
		user.CreatedAt, user.UpdatedAt)
	return err
}

func (d *SQLDatabase) GetUser(ctx context.Context, id string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name,
			phone, address, role, status, avatar, created_at, updated_at
		FROM users WHERE id = ?`
	
	err := d.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password, &user.FirstName, &user.LastName,
		&user.Phone, &user.Address, &user.Role, &user.Status, &user.Avatar,
		&user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (d *SQLDatabase) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name,
			phone, address, role, status, avatar, created_at, updated_at
		FROM users WHERE email = ?`
	
	err := d.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password, &user.FirstName, &user.LastName,
		&user.Phone, &user.Address, &user.Role, &user.Status, &user.Avatar,
		&user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (d *SQLDatabase) UpdateUser(ctx context.Context, user *User) error {
	query := `
		UPDATE users SET username = ?, email = ?, password_hash = ?, first_name = ?, 
			last_name = ?, phone = ?, address = ?, role = ?, status = ?, 
			avatar = ?, updated_at = ?
		WHERE id = ?`
	
	_, err := d.db.ExecContext(ctx, query,
		user.Username, user.Email, user.Password, user.FirstName, user.LastName,
		user.Phone, user.Address, user.Role, user.Status, user.Avatar,
		user.UpdatedAt, user.ID)
	return err
}

func (d *SQLDatabase) ListUsers(ctx context.Context, filter UserFilter) ([]*User, error) {
	query := "SELECT id, username, email, password_hash, first_name, last_name, phone, address, role, status, avatar, created_at, updated_at FROM users WHERE 1=1"
	args := []interface{}{}
	
	if filter.Status != "" {
		query += " AND status = ?"
		args = append(args, filter.Status)
	}
	
	if filter.Role != "" {
		query += " AND role = ?"
		args = append(args, filter.Role)
	}
	
	if filter.Search != "" {
		query += " AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)"
		searchTerm := "%" + filter.Search + "%"
		args = append(args, searchTerm, searchTerm, searchTerm, searchTerm)
	}
	
	query += " ORDER BY created_at DESC"
	
	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
		
		if filter.Offset > 0 {
			query += " OFFSET ?"
			args = append(args, filter.Offset)
		}
	}
	
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var users []*User
	for rows.Next() {
		user := &User{}
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Password, 
			&user.FirstName, &user.LastName, &user.Phone, &user.Address, 
			&user.Role, &user.Status, &user.Avatar, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	
	return users, nil
}

// Helper methods for migrations
func (d *SQLDatabase) isMigrationApplied(ctx context.Context, version int) (bool, error) {
	var applied bool
	err := d.db.QueryRowContext(ctx, 
		"SELECT applied FROM migrations WHERE version = ?", version).Scan(&applied)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return applied, nil
}

func (d *SQLDatabase) runMigration(ctx context.Context, version int, name, migrationSQL string) error {
	tx, err := d.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Execute migration SQL
	if _, err := tx.ExecContext(ctx, migrationSQL); err != nil {
		return fmt.Errorf("failed to execute migration SQL: %w", err)
	}

	// Insert migration record
	_, err = tx.ExecContext(ctx,
		"INSERT INTO migrations (version, name, applied, applied_at) VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)",
		version, name)
	if err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	return tx.Commit()
}

// Item operations
func (d *SQLDatabase) CreateItem(ctx context.Context, item *Item) error {
	query := `
		INSERT INTO items (id, name, title, description, daily_rate, price, image_url, 
			owner_id, available, status, category, location, featured, views, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	
	_, err := d.db.ExecContext(ctx, query,
		item.ID, item.Name, item.Title, item.Description, item.DailyRate, item.Price,
		item.ImageURL, item.OwnerID, item.Available, item.Status, item.Category,
		item.Location, item.Featured, item.Views, item.CreatedAt, item.UpdatedAt)
	return err
}

func (d *SQLDatabase) GetItem(ctx context.Context, id string) (*Item, error) {
	item := &Item{}
	query := `
		SELECT id, name, title, description, daily_rate, price, image_url, owner_id,
			available, status, category, location, featured, views, created_at, updated_at
		FROM items WHERE id = ?`
	
	err := d.db.QueryRowContext(ctx, query, id).Scan(
		&item.ID, &item.Name, &item.Title, &item.Description, &item.DailyRate, &item.Price,
		&item.ImageURL, &item.OwnerID, &item.Available, &item.Status, &item.Category,
		&item.Location, &item.Featured, &item.Views, &item.CreatedAt, &item.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("item not found")
		}
		return nil, err
	}
	return item, nil
}

func (d *SQLDatabase) UpdateItem(ctx context.Context, item *Item) error {
	query := `
		UPDATE items SET name = ?, title = ?, description = ?, daily_rate = ?, price = ?,
			image_url = ?, available = ?, status = ?, category = ?, location = ?,
			featured = ?, views = ?, updated_at = ?
		WHERE id = ?`
	
	_, err := d.db.ExecContext(ctx, query,
		item.Name, item.Title, item.Description, item.DailyRate, item.Price,
		item.ImageURL, item.Available, item.Status, item.Category, item.Location,
		item.Featured, item.Views, item.UpdatedAt, item.ID)
	return err
}

func (d *SQLDatabase) DeleteItem(ctx context.Context, id string) error {
	_, err := d.db.ExecContext(ctx, "DELETE FROM items WHERE id = ?", id)
	return err
}

func (d *SQLDatabase) ListItems(ctx context.Context, filter ItemFilter) ([]*Item, error) {
	query := `SELECT id, name, title, description, daily_rate, price, image_url, owner_id,
		available, status, category, location, featured, views, created_at, updated_at FROM items WHERE 1=1`
	args := []interface{}{}
	
	if filter.Status != "" {
		query += " AND status = ?"
		args = append(args, filter.Status)
	}
	
	if filter.Category != "" {
		query += " AND category = ?"
		args = append(args, filter.Category)
	}
	
	if filter.OwnerID != "" {
		query += " AND owner_id = ?"
		args = append(args, filter.OwnerID)
	}
	
	if filter.Available != nil {
		query += " AND available = ?"
		args = append(args, *filter.Available)
	}
	
	if filter.Search != "" {
		query += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)"
		searchTerm := "%" + filter.Search + "%"
		args = append(args, searchTerm, searchTerm, searchTerm)
	}
	
	if filter.MinPrice != nil {
		query += " AND daily_rate >= ?"
		args = append(args, *filter.MinPrice)
	}
	
	if filter.MaxPrice != nil {
		query += " AND daily_rate <= ?"
		args = append(args, *filter.MaxPrice)
	}
	
	if filter.Location != "" {
		query += " AND location LIKE ?"
		args = append(args, "%"+filter.Location+"%")
	}
	
	// Sorting
	switch filter.SortBy {
	case "price-low":
		query += " ORDER BY daily_rate ASC"
	case "price-high":
		query += " ORDER BY daily_rate DESC"
	case "newest":
		query += " ORDER BY created_at DESC"
	case "featured":
		query += " ORDER BY featured DESC, created_at DESC"
	case "views":
		query += " ORDER BY views DESC"
	default:
		query += " ORDER BY available DESC, featured DESC, created_at DESC"
	}
	
	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
		
		if filter.Offset > 0 {
			query += " OFFSET ?"
			args = append(args, filter.Offset)
		}
	}
	
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var items []*Item
	for rows.Next() {
		item := &Item{}
		err := rows.Scan(&item.ID, &item.Name, &item.Title, &item.Description,
			&item.DailyRate, &item.Price, &item.ImageURL, &item.OwnerID,
			&item.Available, &item.Status, &item.Category, &item.Location,
			&item.Featured, &item.Views, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	
	return items, nil
}

// Booking operations
func (d *SQLDatabase) CreateBooking(ctx context.Context, booking *Booking) error {
	query := `
		INSERT INTO bookings (id, item_id, user_id, start_date, end_date, total_price,
			status, payment_id, notes, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	
	_, err := d.db.ExecContext(ctx, query,
		booking.ID, booking.ItemID, booking.UserID, booking.StartDate, booking.EndDate,
		booking.TotalPrice, booking.Status, booking.PaymentID, booking.Notes,
		booking.CreatedAt, booking.UpdatedAt)
	return err
}

func (d *SQLDatabase) GetBooking(ctx context.Context, id string) (*Booking, error) {
	booking := &Booking{}
	query := `
		SELECT id, item_id, user_id, start_date, end_date, total_price, status,
			payment_id, notes, created_at, updated_at
		FROM bookings WHERE id = ?`
	
	err := d.db.QueryRowContext(ctx, query, id).Scan(
		&booking.ID, &booking.ItemID, &booking.UserID, &booking.StartDate,
		&booking.EndDate, &booking.TotalPrice, &booking.Status, &booking.PaymentID,
		&booking.Notes, &booking.CreatedAt, &booking.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("booking not found")
		}
		return nil, err
	}
	return booking, nil
}

func (d *SQLDatabase) UpdateBooking(ctx context.Context, booking *Booking) error {
	query := `
		UPDATE bookings SET item_id = ?, user_id = ?, start_date = ?, end_date = ?,
			total_price = ?, status = ?, payment_id = ?, notes = ?, updated_at = ?
		WHERE id = ?`
	
	_, err := d.db.ExecContext(ctx, query,
		booking.ItemID, booking.UserID, booking.StartDate, booking.EndDate,
		booking.TotalPrice, booking.Status, booking.PaymentID, booking.Notes,
		booking.UpdatedAt, booking.ID)
	return err
}

func (d *SQLDatabase) ListBookings(ctx context.Context, filter BookingFilter) ([]*Booking, error) {
	query := `SELECT id, item_id, user_id, start_date, end_date, total_price, status,
		payment_id, notes, created_at, updated_at FROM bookings WHERE 1=1`
	args := []interface{}{}
	
	if filter.UserID != "" {
		query += " AND user_id = ?"
		args = append(args, filter.UserID)
	}
	
	if filter.ItemID != "" {
		query += " AND item_id = ?"
		args = append(args, filter.ItemID)
	}
	
	if filter.Status != "" {
		query += " AND status = ?"
		args = append(args, filter.Status)
	}
	
	if filter.DateFrom != nil {
		query += " AND start_date >= ?"
		args = append(args, *filter.DateFrom)
	}
	
	if filter.DateTo != nil {
		query += " AND end_date <= ?"
		args = append(args, *filter.DateTo)
	}
	
	query += " ORDER BY created_at DESC"
	
	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
		
		if filter.Offset > 0 {
			query += " OFFSET ?"
			args = append(args, filter.Offset)
		}
	}
	
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var bookings []*Booking
	for rows.Next() {
		booking := &Booking{}
		err := rows.Scan(&booking.ID, &booking.ItemID, &booking.UserID,
			&booking.StartDate, &booking.EndDate, &booking.TotalPrice,
			&booking.Status, &booking.PaymentID, &booking.Notes,
			&booking.CreatedAt, &booking.UpdatedAt)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, booking)
	}
	
	return bookings, nil
}

func (d *SQLDatabase) CheckAvailability(ctx context.Context, itemID string, startDate, endDate time.Time) (bool, error) {
	query := `
		SELECT COUNT(*) FROM bookings 
		WHERE item_id = ? AND status != 'cancelled' 
		AND (start_date < ? AND end_date > ?)`
	
	var count int
	err := d.db.QueryRowContext(ctx, query, itemID, endDate, startDate).Scan(&count)
	if err != nil {
		return false, err
	}
	
	return count == 0, nil
}

// Admin operations
func (d *SQLDatabase) CreateAdminLog(ctx context.Context, log *AdminLog) error {
	query := `
		INSERT INTO admin_logs (id, admin_user_id, action, target_type, target_id,
			details, ip_address, user_agent, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	
	_, err := d.db.ExecContext(ctx, query,
		log.ID, log.AdminUserID, log.Action, log.TargetType, log.TargetID,
		log.Details, log.IPAddress, log.UserAgent, log.CreatedAt)
	return err
}

func (d *SQLDatabase) ListAdminLogs(ctx context.Context, filter AdminLogFilter) ([]*AdminLog, error) {
	query := `SELECT id, admin_user_id, action, target_type, target_id, details,
		ip_address, user_agent, created_at FROM admin_logs WHERE 1=1`
	args := []interface{}{}
	
	if filter.AdminUserID != "" {
		query += " AND admin_user_id = ?"
		args = append(args, filter.AdminUserID)
	}
	
	if filter.Action != "" {
		query += " AND action = ?"
		args = append(args, filter.Action)
	}
	
	if filter.TargetType != "" {
		query += " AND target_type = ?"
		args = append(args, filter.TargetType)
	}
	
	if filter.TargetID != "" {
		query += " AND target_id = ?"
		args = append(args, filter.TargetID)
	}
	
	if filter.DateFrom != nil {
		query += " AND created_at >= ?"
		args = append(args, *filter.DateFrom)
	}
	
	if filter.DateTo != nil {
		query += " AND created_at <= ?"
		args = append(args, *filter.DateTo)
	}
	
	query += " ORDER BY created_at DESC"
	
	if filter.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filter.Limit)
		
		if filter.Offset > 0 {
			query += " OFFSET ?"
			args = append(args, filter.Offset)
		}
	}
	
	rows, err := d.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var logs []*AdminLog
	for rows.Next() {
		log := &AdminLog{}
		err := rows.Scan(&log.ID, &log.AdminUserID, &log.Action, &log.TargetType,
			&log.TargetID, &log.Details, &log.IPAddress, &log.UserAgent, &log.CreatedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	
	return logs, nil
}

func (d *SQLDatabase) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{}
	
	// Get basic counts
	err := d.db.QueryRowContext(ctx, `
		SELECT 
			(SELECT COUNT(*) FROM users) as total_users,
			(SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
			(SELECT COUNT(*) FROM items) as total_items,
			(SELECT COUNT(*) FROM items WHERE status = 'pending') as pending_items,
			(SELECT COUNT(*) FROM items WHERE status = 'approved') as approved_items,
			(SELECT COUNT(*) FROM bookings) as total_bookings,
			(SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed', 'completed')) as active_bookings,
			(SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed') as total_revenue
	`).Scan(&stats.TotalUsers, &stats.ActiveUsers, &stats.TotalItems, &stats.PendingItems,
		&stats.ApprovedItems, &stats.TotalBookings, &stats.ActiveBookings, &stats.TotalRevenue)
	
	if err != nil {
		return nil, err
	}
	
	// Get monthly revenue for current month
	currentMonth := time.Now().Format("2006-01")
	err = d.db.QueryRowContext(ctx, `
		SELECT COALESCE(SUM(total_price), 0) FROM bookings 
		WHERE status = 'completed' AND DATE(created_at) >= ?
	`, currentMonth+"-01").Scan(&stats.MonthlyRevenue)
	
	if err != nil {
		stats.MonthlyRevenue = 0
	}
	
	return stats, nil
}

// System settings operations  
func (d *SQLDatabase) GetSystemSetting(ctx context.Context, key string) (*SystemSetting, error) {
	setting := &SystemSetting{}
	query := `
		SELECT id, setting_key, setting_value, setting_type, description, 
			category, is_public, created_at, updated_at
		FROM system_settings WHERE setting_key = ?`
	
	err := d.db.QueryRowContext(ctx, query, key).Scan(
		&setting.ID, &setting.Key, &setting.Value, &setting.Type,
		&setting.Description, &setting.Category, &setting.IsPublic,
		&setting.CreatedAt, &setting.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("setting not found")
		}
		return nil, err
	}
	return setting, nil
}

func (d *SQLDatabase) SetSystemSetting(ctx context.Context, setting *SystemSetting) error {
	query := `
		INSERT INTO system_settings (id, setting_key, setting_value, setting_type,
			description, category, is_public, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(setting_key) DO UPDATE SET
		setting_value = ?, setting_type = ?, description = ?, category = ?,
		is_public = ?, updated_at = ?`
	
	if d.dbType == "mysql" {
		query = `
			INSERT INTO system_settings (id, setting_key, setting_value, setting_type,
				description, category, is_public, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
			setting_value = ?, setting_type = ?, description = ?, category = ?,
			is_public = ?, updated_at = ?`
	} else if d.dbType == "sqlite" {
		query = `
			INSERT OR REPLACE INTO system_settings (id, setting_key, setting_value, setting_type,
				description, category, is_public, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		
		_, err := d.db.ExecContext(ctx, query,
			setting.ID, setting.Key, setting.Value, setting.Type,
			setting.Description, setting.Category, setting.IsPublic,
			setting.CreatedAt, setting.UpdatedAt)
		return err
	}
	
	_, err := d.db.ExecContext(ctx, query,
		setting.ID, setting.Key, setting.Value, setting.Type,
		setting.Description, setting.Category, setting.IsPublic,
		setting.CreatedAt, setting.UpdatedAt,
		setting.Value, setting.Type, setting.Description, setting.Category,
		setting.IsPublic, setting.UpdatedAt)
	return err
}

func (d *SQLDatabase) ListSystemSettings(ctx context.Context) ([]*SystemSetting, error) {
	query := `SELECT id, setting_key, setting_value, setting_type, description,
		category, is_public, created_at, updated_at FROM system_settings ORDER BY category, setting_key`
	
	rows, err := d.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var settings []*SystemSetting
	for rows.Next() {
		setting := &SystemSetting{}
		err := rows.Scan(&setting.ID, &setting.Key, &setting.Value, &setting.Type,
			&setting.Description, &setting.Category, &setting.IsPublic,
			&setting.CreatedAt, &setting.UpdatedAt)
		if err != nil {
			return nil, err
		}
		settings = append(settings, setting)
	}
	
	return settings, nil
}

// Placeholder implementations for remaining operations
func (d *SQLDatabase) CreatePayment(ctx context.Context, payment *Payment) error {
	// Implementation similar to other Create methods
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) GetPayment(ctx context.Context, id string) (*Payment, error) {
	return nil, fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) UpdatePayment(ctx context.Context, payment *Payment) error {
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) ListPayments(ctx context.Context, filter PaymentFilter) ([]*Payment, error) {
	return nil, fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) CreateRating(ctx context.Context, rating *Rating) error {
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) GetRating(ctx context.Context, id string) (*Rating, error) {
	return nil, fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) UpdateRating(ctx context.Context, rating *Rating) error {
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) DeleteRating(ctx context.Context, id string) error {
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) ListItemRatings(ctx context.Context, itemID string) ([]*Rating, error) {
	return nil, fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) CreateMessage(ctx context.Context, message *Message) error {
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) GetMessage(ctx context.Context, id string) (*Message, error) {
	return nil, fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) UpdateMessage(ctx context.Context, message *Message) error {
	return fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) ListConversation(ctx context.Context, userID1, userID2 string) ([]*Message, error) {
	return nil, fmt.Errorf("not implemented yet")
}

func (d *SQLDatabase) ListUserConversations(ctx context.Context, userID string) ([]*ConversationSummary, error) {
	return nil, fmt.Errorf("not implemented yet")
}

// Migration SQL content
func (d *SQLDatabase) getInitialSchemaMigration() string {
	// Adjust SQL for different database types
	switch d.dbType {
	case "postgres":
		return d.getPostgresSchemaMigration()
	case "mysql":
		return d.getMySQLSchemaMigration()
	default: // sqlite
		return d.getSQLiteSchemaMigration()
	}
}

func (d *SQLDatabase) getAdditionalTablesMigration() string {
	switch d.dbType {
	case "postgres":
		return d.getPostgresAdditionalTablesMigration()
	case "mysql":
		return d.getMySQLAdditionalTablesMigration()
	default: // sqlite
		return d.getSQLiteAdditionalTablesMigration()
	}
}