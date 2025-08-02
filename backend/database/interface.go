package database

import (
	"context"
	"time"
)

// Database interface defines the contract for all database operations
type Database interface {
	// Connection management
	Connect(ctx context.Context) error
	Close() error
	Ping(ctx context.Context) error
	
	// User operations
	CreateUser(ctx context.Context, user *User) error
	GetUser(ctx context.Context, id string) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	UpdateUser(ctx context.Context, user *User) error
	ListUsers(ctx context.Context, filter UserFilter) ([]*User, error)
	
	// Item operations
	CreateItem(ctx context.Context, item *Item) error
	GetItem(ctx context.Context, id string) (*Item, error)
	UpdateItem(ctx context.Context, item *Item) error
	DeleteItem(ctx context.Context, id string) error
	ListItems(ctx context.Context, filter ItemFilter) ([]*Item, error)
	
	// Booking operations
	CreateBooking(ctx context.Context, booking *Booking) error
	GetBooking(ctx context.Context, id string) (*Booking, error)
	UpdateBooking(ctx context.Context, booking *Booking) error
	ListBookings(ctx context.Context, filter BookingFilter) ([]*Booking, error)
	CheckAvailability(ctx context.Context, itemID string, startDate, endDate time.Time) (bool, error)
	
	// Payment operations
	CreatePayment(ctx context.Context, payment *Payment) error
	GetPayment(ctx context.Context, id string) (*Payment, error)
	UpdatePayment(ctx context.Context, payment *Payment) error
	ListPayments(ctx context.Context, filter PaymentFilter) ([]*Payment, error)
	
	// Rating operations
	CreateRating(ctx context.Context, rating *Rating) error
	GetRating(ctx context.Context, id string) (*Rating, error)
	UpdateRating(ctx context.Context, rating *Rating) error
	DeleteRating(ctx context.Context, id string) error
	ListItemRatings(ctx context.Context, itemID string) ([]*Rating, error)
	
	// Message operations
	CreateMessage(ctx context.Context, message *Message) error
	GetMessage(ctx context.Context, id string) (*Message, error)
	UpdateMessage(ctx context.Context, message *Message) error
	ListConversation(ctx context.Context, userID1, userID2 string) ([]*Message, error)
	ListUserConversations(ctx context.Context, userID string) ([]*ConversationSummary, error)
	
	// Admin operations
	CreateAdminLog(ctx context.Context, log *AdminLog) error
	ListAdminLogs(ctx context.Context, filter AdminLogFilter) ([]*AdminLog, error)
	GetDashboardStats(ctx context.Context) (*DashboardStats, error)
	
	// System operations
	GetSystemSetting(ctx context.Context, key string) (*SystemSetting, error)
	SetSystemSetting(ctx context.Context, setting *SystemSetting) error
	ListSystemSettings(ctx context.Context) ([]*SystemSetting, error)
	
	// Migration operations
	Migrate(ctx context.Context) error
	GetMigrationVersion(ctx context.Context) (int, error)
	SetMigrationVersion(ctx context.Context, version int) error
}

// Filter types for database queries
type UserFilter struct {
	Status string
	Role   string
	Search string
	Limit  int
	Offset int
}

type ItemFilter struct {
	Status     string
	Category   string
	OwnerID    string
	Available  *bool
	Search     string
	MinPrice   *float64
	MaxPrice   *float64
	Location   string
	SortBy     string
	Limit      int
	Offset     int
}

type BookingFilter struct {
	UserID   string
	ItemID   string
	OwnerID  string
	Status   string
	DateFrom *time.Time
	DateTo   *time.Time
	Limit    int
	Offset   int
}

type PaymentFilter struct {
	UserID    string
	BookingID string
	Status    string
	Method    string
	Limit     int
	Offset    int
}

type AdminLogFilter struct {
	AdminUserID string
	Action      string
	TargetType  string
	TargetID    string
	DateFrom    *time.Time
	DateTo      *time.Time
	Limit       int
	Offset      int
}

// Response types
type ConversationSummary struct {
	PartnerUser *User    `json:"partnerUser"`
	LastMessage *Message `json:"lastMessage"`
	UnreadCount int      `json:"unreadCount"`
}

type DashboardStats struct {
	TotalUsers     int     `json:"totalUsers"`
	ActiveUsers    int     `json:"activeUsers"`
	TotalItems     int     `json:"totalItems"`
	PendingItems   int     `json:"pendingItems"`
	ApprovedItems  int     `json:"approvedItems"`
	TotalBookings  int     `json:"totalBookings"`
	ActiveBookings int     `json:"activeBookings"`
	TotalRevenue   float64 `json:"totalRevenue"`
	MonthlyRevenue float64 `json:"monthlyRevenue"`
	
	// Additional analytics
	UserGrowth      []GrowthData     `json:"userGrowth"`
	RevenueGrowth   []GrowthData     `json:"revenueGrowth"`
	PopularCategories []CategoryData `json:"popularCategories"`
	TopItems        []ItemStats      `json:"topItems"`
}

type GrowthData struct {
	Period string  `json:"period"`
	Count  int     `json:"count"`
	Value  float64 `json:"value"`
}

type CategoryData struct {
	Category    string `json:"category"`
	ItemCount   int    `json:"itemCount"`
	BookingCount int   `json:"bookingCount"`
	Revenue     float64 `json:"revenue"`
}

type ItemStats struct {
	Item        *Item   `json:"item"`
	BookingCount int    `json:"bookingCount"`
	Revenue     float64 `json:"revenue"`
	AverageRating float64 `json:"averageRating"`
}