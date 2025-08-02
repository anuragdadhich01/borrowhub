package seeds

import (
	"context"
	"time"

	"borrowhub/database"
	"golang.org/x/crypto/bcrypt"
)

// SeedData populates the database with initial sample data
func SeedData(ctx context.Context, db database.Database) error {
	// Create sample users
	users := []*database.User{
		{
			ID:        "1",
			Username:  "john_doe",
			Email:     "john@example.com",
			FirstName: "John",
			LastName:  "Doe",
			Phone:     "1234567890",
			Address:   "123 Main St, Mumbai",
			Role:      "user",
			Status:    "active",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "2", 
			Username:  "jane_smith",
			Email:     "jane@example.com",
			FirstName: "Jane",
			LastName:  "Smith",
			Phone:     "0987654321",
			Address:   "456 Oak Ave, Delhi",
			Role:      "user",
			Status:    "active",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "3",
			Username:  "admin",
			Email:     "admin@borrowhub.com",
			FirstName: "Admin",
			LastName:  "User",
			Phone:     "1111111111",
			Address:   "Admin Office, Bangalore",
			Role:      "admin",
			Status:    "active",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	// Hash password for all users
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	for _, user := range users {
		user.Password = string(hashedPassword)
		if err := db.CreateUser(ctx, user); err != nil {
			// User might already exist, continue
			continue
		}
	}

	// Create sample categories (for future use)
	_ = []*database.Category{
		{
			ID:          "cat1",
			Name:        "Electronics",
			Slug:        "electronics",
			Description: "Electronic devices and gadgets",
			Icon:        "📱",
			SortOrder:   1,
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "cat2",
			Name:        "Sports & Outdoor",
			Slug:        "sports-outdoor",
			Description: "Sports equipment and outdoor gear",
			Icon:        "⚽",
			SortOrder:   2,
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "cat3",
			Name:        "Tools & Equipment",
			Slug:        "tools-equipment",
			Description: "Tools and professional equipment",
			Icon:        "🔧",
			SortOrder:   3,
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "cat4",
			Name:        "Home & Garden",
			Slug:        "home-garden",
			Description: "Home appliances and garden equipment",
			Icon:        "🏠",
			SortOrder:   4,
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "cat5",
			Name:        "Vehicles",
			Slug:        "vehicles",
			Description: "Cars, bikes, and transportation",
			Icon:        "🚗",
			SortOrder:   5,
			IsActive:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	// Note: Need to implement CreateCategory method in database interface
	// For now, we'll skip categories and just create items with category strings

	// Create sample items
	items := []*database.Item{
		{
			ID:          "item1",
			Name:        "Professional DSLR Camera",
			Title:       "Professional DSLR Camera",
			Description: "High-end DSLR camera perfect for photography enthusiasts and professionals. Includes lens kit and accessories.",
			DailyRate:   75.0,
			Price:       75,
			ImageURL:    "https://placehold.co/600x400/556cd6/white?text=DSLR+Camera",
			OwnerID:     "1",
			Available:   true,
			Status:      "approved",
			Category:    "Electronics",
			Location:    "Mumbai, Maharashtra",
			Featured:    true,
			Views:       120,
			CreatedAt:   time.Now().AddDate(0, 0, -10),
			UpdatedAt:   time.Now().AddDate(0, 0, -1),
		},
		{
			ID:          "item2",
			Name:        "Mountain Bike - Trek",
			Title:       "Mountain Bike - Trek",
			Description: "High-quality Trek mountain bike suitable for all terrains. Perfect for weekend adventures and fitness.",
			DailyRate:   40.0,
			Price:       40,
			ImageURL:    "https://placehold.co/600x400/556cd6/white?text=Mountain+Bike",
			OwnerID:     "2",
			Available:   true,
			Status:      "approved",
			Category:    "Sports & Outdoor",
			Location:    "Delhi, NCR",
			Featured:    false,
			Views:       89,
			CreatedAt:   time.Now().AddDate(0, 0, -8),
			UpdatedAt:   time.Now().AddDate(0, 0, -2),
		},
		{
			ID:          "item3",
			Name:        "Gaming Console PS5",
			Title:       "Gaming Console PS5",
			Description: "Latest PlayStation 5 gaming console with multiple games included. Perfect for gaming enthusiasts.",
			DailyRate:   35.0,
			Price:       35,
			ImageURL:    "https://placehold.co/600x400/556cd6/white?text=PS5+Console",
			OwnerID:     "1",
			Available:   true,
			Status:      "approved",
			Category:    "Electronics",
			Location:    "Mumbai, Maharashtra",
			Featured:    true,
			Views:       156,
			CreatedAt:   time.Now().AddDate(0, 0, -5),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "item4",
			Name:        "Power Drill Set",
			Title:       "Power Drill Set",
			Description: "Professional cordless power drill with complete bit set. Great for DIY projects and home repairs.",
			DailyRate:   25.0,
			Price:       25,
			ImageURL:    "https://placehold.co/600x400/556cd6/white?text=Power+Drill",
			OwnerID:     "2",
			Available:   true,
			Status:      "approved",
			Category:    "Tools & Equipment",
			Location:    "Delhi, NCR",
			Featured:    false,
			Views:       45,
			CreatedAt:   time.Now().AddDate(0, 0, -3),
			UpdatedAt:   time.Now().AddDate(0, 0, -1),
		},
		{
			ID:          "item5",
			Name:        "Pressure Washer",
			Title:       "Pressure Washer",
			Description: "High-pressure washer for cleaning cars, driveways, and outdoor surfaces. Easy to use and efficient.",
			DailyRate:   30.0,
			Price:       30,
			ImageURL:    "https://placehold.co/600x400/556cd6/white?text=Pressure+Washer",
			OwnerID:     "1",
			Available:   false,
			Status:      "pending",
			Category:    "Home & Garden",
			Location:    "Mumbai, Maharashtra",
			Featured:    false,
			Views:       23,
			CreatedAt:   time.Now().AddDate(0, 0, -1),
			UpdatedAt:   time.Now(),
		},
	}

	for _, item := range items {
		if err := db.CreateItem(ctx, item); err != nil {
			// Item might already exist, continue
			continue
		}
	}

	// Create sample bookings
	bookings := []*database.Booking{
		{
			ID:         "booking1",
			ItemID:     "item1",
			UserID:     "2",
			StartDate:  time.Now().AddDate(0, 0, -7),
			EndDate:    time.Now().AddDate(0, 0, -5),
			TotalPrice: 150.0,
			Status:     "completed",
			Notes:      "Great camera for the wedding shoot!",
			CreatedAt:  time.Now().AddDate(0, 0, -10),
			UpdatedAt:  time.Now().AddDate(0, 0, -4),
		},
		{
			ID:         "booking2",
			ItemID:     "item2",
			UserID:     "1",
			StartDate:  time.Now().AddDate(0, 0, 2),
			EndDate:    time.Now().AddDate(0, 0, 4),
			TotalPrice: 80.0,
			Status:     "confirmed",
			Notes:      "Planning a weekend mountain trip",
			CreatedAt:  time.Now().AddDate(0, 0, -3),
			UpdatedAt:  time.Now().AddDate(0, 0, -1),
		},
	}

	for _, booking := range bookings {
		if err := db.CreateBooking(ctx, booking); err != nil {
			// Booking might already exist, continue
			continue
		}
	}

	// Create system settings
	settings := []*database.SystemSetting{
		{
			ID:          "setting1",
			Key:         "site_name",
			Value:       "BorrowHub",
			Type:        "string",
			Description: "The name of the website",
			Category:    "general",
			IsPublic:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "setting2",
			Key:         "registration_enabled",
			Value:       "true",
			Type:        "bool",
			Description: "Whether new user registration is enabled",
			Category:    "general",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "setting3",
			Key:         "max_booking_days",
			Value:       "30",
			Type:        "int",
			Description: "Maximum number of days for a single booking",
			Category:    "booking",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "setting4",
			Key:         "commission_rate",
			Value:       "0.05",
			Type:        "float",
			Description: "Platform commission rate (5%)",
			Category:    "payment",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, setting := range settings {
		if err := db.SetSystemSetting(ctx, setting); err != nil {
			// Setting might already exist, continue
			continue
		}
	}

	// Create admin log entries
	adminLogs := []*database.AdminLog{
		{
			ID:          "log1",
			AdminUserID: "3",
			Action:      "item_approve",
			TargetType:  "item",
			TargetID:    "item1",
			Details:     "Approved camera listing after review",
			IPAddress:   "192.168.1.100",
			UserAgent:   "Mozilla/5.0 (admin browser)",
			CreatedAt:   time.Now().AddDate(0, 0, -9),
		},
		{
			ID:          "log2",
			AdminUserID: "3",
			Action:      "system_setting_update",
			TargetType:  "system",
			TargetID:    "setting2",
			Details:     "Enabled user registration",
			IPAddress:   "192.168.1.100",
			UserAgent:   "Mozilla/5.0 (admin browser)",
			CreatedAt:   time.Now().AddDate(0, 0, -5),
		},
	}

	for _, log := range adminLogs {
		if err := db.CreateAdminLog(ctx, log); err != nil {
			// Log might already exist, continue
			continue
		}
	}

	return nil
}