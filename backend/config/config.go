package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// DatabaseConfig holds PostgreSQL database configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	Database string
	Username string
	Password string
	SSLMode  string
	
	// Connection pool settings
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime int // seconds
}

// AppConfig holds all application configuration
type AppConfig struct {
	// Server settings
	Port            int
	Environment     string // "development", "staging", "production"
	JWTSecret       string
	
	// Database
	Database DatabaseConfig
	
	// External services
	RazorpayKey    string
	RazorpaySecret string
	
	// Storage
	StorageType   string // "local", "s3", "gcs"
	StorageBucket string
	StoragePath   string
	
	// Email
	EmailProvider string // "smtp", "sendgrid", "ses"
	EmailFromName string
	EmailFromAddr string
	SMTPHost      string
	SMTPPort      int
	SMTPUsername  string
	SMTPPassword  string
	
	// Security
	CORSOrigins         []string
	RateLimitEnabled    bool
	RateLimitRPS        int
	SessionTimeout      int // minutes
	PasswordMinLength   int
	RequireEmailVerify  bool
	
	// Features
	EnableRegistration bool
	EnableMessaging    bool
	EnableRatings      bool
	MaintenanceMode    bool
	
	// Admin
	AdminPanelEnabled bool
	SuperAdminEmail   string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*AppConfig, error) {
	config := &AppConfig{
		// Default values
		Port:        getEnvInt("PORT", 8080),
		Environment: getEnv("ENVIRONMENT", "development"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		
		// Database defaults
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnvInt("DB_PORT", 5432),
			Database:        getEnv("DB_NAME", "borrowhub"),
			Username:        getEnv("DB_USER", "borrowhub"),
			Password:        getEnv("DB_PASSWORD", ""),
			SSLMode:         getEnv("DB_SSLMODE", "disable"),
			MaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: getEnvInt("DB_CONN_MAX_LIFETIME", 300),
		},
		
		// External services
		RazorpayKey:    getEnv("RAZORPAY_KEY", ""),
		RazorpaySecret: getEnv("RAZORPAY_SECRET", ""),
		
		// Storage
		StorageType:   getEnv("STORAGE_TYPE", "local"),
		StorageBucket: getEnv("STORAGE_BUCKET", ""),
		StoragePath:   getEnv("STORAGE_PATH", "./uploads"),
		
		// Email
		EmailProvider: getEnv("EMAIL_PROVIDER", "smtp"),
		EmailFromName: getEnv("EMAIL_FROM_NAME", "BorrowHub"),
		EmailFromAddr: getEnv("EMAIL_FROM_ADDR", "noreply@borrowhub.com"),
		SMTPHost:      getEnv("SMTP_HOST", ""),
		SMTPPort:      getEnvInt("SMTP_PORT", 587),
		SMTPUsername:  getEnv("SMTP_USERNAME", ""),
		SMTPPassword:  getEnv("SMTP_PASSWORD", ""),
		
		// Security
		CORSOrigins:         getEnvStringSlice("CORS_ORIGINS", []string{"http://localhost:5173", "http://127.0.0.1:5173"}),
		RateLimitEnabled:    getEnvBool("RATE_LIMIT_ENABLED", false),
		RateLimitRPS:        getEnvInt("RATE_LIMIT_RPS", 10),
		SessionTimeout:      getEnvInt("SESSION_TIMEOUT", 1440), // 24 hours
		PasswordMinLength:   getEnvInt("PASSWORD_MIN_LENGTH", 8),
		RequireEmailVerify:  getEnvBool("REQUIRE_EMAIL_VERIFY", false),
		
		// Features
		EnableRegistration: getEnvBool("ENABLE_REGISTRATION", true),
		EnableMessaging:    getEnvBool("ENABLE_MESSAGING", true),
		EnableRatings:      getEnvBool("ENABLE_RATINGS", true),
		MaintenanceMode:    getEnvBool("MAINTENANCE_MODE", false),
		
		// Admin
		AdminPanelEnabled: getEnvBool("ADMIN_PANEL_ENABLED", true),
		SuperAdminEmail:   getEnv("SUPER_ADMIN_EMAIL", "admin@borrowhub.com"),
	}
	
	// Validate required settings
	if config.Environment == "production" {
		if config.JWTSecret == "your-secret-key-change-in-production" {
			return nil, fmt.Errorf("JWT_SECRET must be set in production")
		}
		if config.Database.Password == "" {
			return nil, fmt.Errorf("database password is required in production")
		}
	}
	
	return config, nil
}

// GetDSN returns the PostgreSQL database connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.Username, c.Password, c.Database, c.SSLMode)
}

// IsDevelopment returns true if running in development mode
func (c *AppConfig) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if running in production mode
func (c *AppConfig) IsProduction() bool {
	return c.Environment == "production"
}

// Helper functions to get environment variables with defaults
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}

func getEnvStringSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}