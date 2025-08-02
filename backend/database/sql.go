package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
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
	d.db, err = sql.Open(d.dbType, dsn)
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