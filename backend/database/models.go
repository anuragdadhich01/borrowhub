package database

import (
	"encoding/json"
	"time"
)

// User model with enhanced profile fields
type User struct {
	ID        string    `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"password,omitempty" db:"password_hash"`
	FirstName string    `json:"firstName" db:"first_name"`
	LastName  string    `json:"lastName" db:"last_name"`
	Phone     string    `json:"phone" db:"phone"`
	Address   string    `json:"address" db:"address"`
	Role      string    `json:"role" db:"role"`      // "user", "admin"
	Status    string    `json:"status" db:"status"`  // "active", "suspended", "banned"
	Avatar    string    `json:"avatar,omitempty" db:"avatar"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

// Item model with all required fields
type Item struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Title       string    `json:"title" db:"title"`               // Keep for backward compatibility
	Description string    `json:"description" db:"description"`
	DailyRate   float64   `json:"dailyRate" db:"daily_rate"`
	Price       int       `json:"price" db:"price"`               // Keep for backward compatibility
	ImageURL    string    `json:"imageUrl" db:"image_url"`
	OwnerID     string    `json:"ownerId" db:"owner_id"`
	Available   bool      `json:"available" db:"available"`
	Status      string    `json:"status" db:"status"`             // "pending", "approved", "rejected"
	Category    string    `json:"category" db:"category"`
	Location    string    `json:"location" db:"location"`
	Featured    bool      `json:"featured" db:"featured"`
	Views       int       `json:"views" db:"views"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// Booking model with proper relationships and status
type Booking struct {
	ID          string    `json:"id" db:"id"`
	ItemID      string    `json:"itemId" db:"item_id"`
	UserID      string    `json:"userId" db:"user_id"`
	StartDate   time.Time `json:"startDate" db:"start_date"`
	EndDate     time.Time `json:"endDate" db:"end_date"`
	TotalPrice  float64   `json:"totalPrice" db:"total_price"`
	Status      string    `json:"status" db:"status"`     // "pending", "confirmed", "completed", "cancelled"
	PaymentID   string    `json:"paymentId,omitempty" db:"payment_id"`
	Notes       string    `json:"notes,omitempty" db:"notes"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// Payment model for tracking transactions
type Payment struct {
	ID            string    `json:"id" db:"id"`
	BookingID     string    `json:"bookingId" db:"booking_id"`
	Amount        float64   `json:"amount" db:"amount"`
	Currency      string    `json:"currency" db:"currency"`
	Status        string    `json:"status" db:"status"`                     // "pending", "success", "failed", "refunded"
	PaymentMethod string    `json:"paymentMethod" db:"payment_method"`       // "razorpay", "card", "upi"
	GatewayID     string    `json:"gatewayId,omitempty" db:"gateway_id"`     // Razorpay payment ID
	GatewayData   string    `json:"gatewayData,omitempty" db:"gateway_data"` // JSON data from payment gateway
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
}

// Rating model for user ratings
type Rating struct {
	ID         string          `json:"id" db:"id"`
	ItemID     string          `json:"itemId" db:"item_id"`
	UserID     string          `json:"userId" db:"user_id"`
	BookingID  string          `json:"bookingId" db:"booking_id"`
	Rating     int             `json:"rating" db:"rating"`         // 1-5 stars
	Review     string          `json:"review" db:"review"`
	Photos     json.RawMessage `json:"photos,omitempty" db:"photos"` // JSON array of photo URLs
	IsVerified bool            `json:"isVerified" db:"is_verified"`  // Based on completed booking
	CreatedAt  time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time       `json:"updatedAt" db:"updated_at"`
}

// Message model for in-app messaging
type Message struct {
	ID          string    `json:"id" db:"id"`
	FromUserID  string    `json:"fromUserId" db:"from_user_id"`
	ToUserID    string    `json:"toUserId" db:"to_user_id"`
	ItemID      string    `json:"itemId,omitempty" db:"item_id"`      // Optional: item-specific conversation
	BookingID   string    `json:"bookingId,omitempty" db:"booking_id"` // Optional: booking-specific conversation
	Content     string    `json:"content" db:"content"`
	MessageType string    `json:"messageType" db:"message_type"`      // "text", "image", "file"
	FileURL     string    `json:"fileUrl,omitempty" db:"file_url"`
	IsRead      bool      `json:"isRead" db:"is_read"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// Admin Activity Log for tracking admin actions
type AdminLog struct {
	ID          string    `json:"id" db:"id"`
	AdminUserID string    `json:"adminUserId" db:"admin_user_id"`
	Action      string    `json:"action" db:"action"`           // "user_suspend", "item_approve", "item_reject", etc.
	TargetType  string    `json:"targetType" db:"target_type"`  // "user", "item", "booking", "payment"
	TargetID    string    `json:"targetId" db:"target_id"`
	Details     string    `json:"details" db:"details"`
	IPAddress   string    `json:"ipAddress,omitempty" db:"ip_address"`
	UserAgent   string    `json:"userAgent,omitempty" db:"user_agent"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// System Settings for application configuration
type SystemSetting struct {
	ID          string    `json:"id" db:"id"`
	Key         string    `json:"key" db:"setting_key"`
	Value       string    `json:"value" db:"setting_value"`
	Type        string    `json:"type" db:"setting_type"`           // "string", "int", "float", "bool", "json"
	Description string    `json:"description" db:"description"`
	Category    string    `json:"category" db:"category"`           // "general", "email", "payment", "security"
	IsPublic    bool      `json:"isPublic" db:"is_public"`          // Can be accessed by frontend
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// Category model for item organization
type Category struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description string    `json:"description" db:"description"`
	Icon        string    `json:"icon" db:"icon"`
	ImageURL    string    `json:"imageUrl" db:"image_url"`
	ParentID    string    `json:"parentId,omitempty" db:"parent_id"` // For subcategories
	SortOrder   int       `json:"sortOrder" db:"sort_order"`
	IsActive    bool      `json:"isActive" db:"is_active"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

// Database migration tracking
type Migration struct {
	ID        int       `json:"id" db:"id"`
	Version   int       `json:"version" db:"version"`
	Name      string    `json:"name" db:"name"`
	Applied   bool      `json:"applied" db:"applied"`
	AppliedAt time.Time `json:"appliedAt" db:"applied_at"`
}

// Calendar availability response
type AvailabilityCalendar struct {
	Date      string  `json:"date"`
	Available bool    `json:"available"`
	Price     float64 `json:"price,omitempty"`
}