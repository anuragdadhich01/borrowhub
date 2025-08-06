# BorrowHub PostgreSQL Database Implementation

## Overview
BorrowHub is built as an AWS-ready application with a streamlined PostgreSQL database backend. The application is optimized for production deployment on AWS RDS with PostgreSQL, providing a robust, scalable, and maintainable database layer.

## 🗄️ Database Architecture

### Single Database Approach
- **PostgreSQL Only**: Streamlined to work exclusively with PostgreSQL/AWS RDS
- **Production Ready**: Optimized for AWS deployment with RDS PostgreSQL
- **Simplified Configuration**: Single database configuration reduces complexity
- **Enhanced Security**: Focused security measures for PostgreSQL deployment

### Database Structure
```
📁 backend/database/
├── 📄 interface.go          # Database interface definition
├── 📄 models.go            # Data models and structures
├── 📄 sql.go               # PostgreSQL database implementation
├── 📄 migrations_sql.go    # PostgreSQL migrations
└── 📂 seeds/               # Database seeding
    └── seed.go
```

### Database Schema
- **Users**: Enhanced user profiles with roles and status management
- **Items**: Comprehensive item management with categories and moderation
- **Bookings**: Full booking lifecycle with payment integration
- **Payments**: Payment transaction management with Razorpay integration
- **Ratings**: User review and rating system with verification
- **Messages**: In-app messaging system for user communication
- **Admin Logs**: Complete audit trail for administrative actions
- **System Settings**: Dynamic configuration management

## 🔧 Configuration

### Environment Variables
```bash
# PostgreSQL Database Configuration
DB_HOST=localhost                    # AWS RDS endpoint in production
DB_PORT=5432
DB_NAME=borrowhub
DB_USER=borrowhub
DB_PASSWORD=password123              # Secure password in production
DB_SSLMODE=disable                   # require for production

# Connection Pool Settings
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=300

# AWS RDS Production Example:
# DB_HOST=borrowhub-prod.cluster-xyz.us-east-1.rds.amazonaws.com
# DB_SSLMODE=require
```

### Configuration Management
- **Centralized Config**: All database settings in `config/config.go`
- **Environment-Based**: Automatic configuration based on deployment environment
- **AWS Integration**: Built-in support for AWS RDS connection strings
- **SSL Support**: Configurable SSL modes for secure connections

## 🏗️ Development Setup

### Using Docker (Recommended)
```bash
# Start PostgreSQL service
docker-compose up -d postgres

# Access pgAdmin for database management
# URL: http://localhost:5050
# Email: admin@borrowhub.com
# Password: admin123
```

### Local Development
```bash
# Backend setup
cd backend
go mod tidy
go build -o borrowhub .

# Run with PostgreSQL
DB_HOST=localhost ./borrowhub
```

## 🛡️ Security Features

### Database Security
- **Parameterized Queries**: Complete protection against SQL injection
- **Connection Security**: SSL/TLS support for encrypted connections
- **Environment-Based Credentials**: Secure credential management
- **Connection Pooling**: Optimized connection management
- **Access Control**: Role-based database permissions

### Production Security
- **AWS RDS Integration**: Native support for AWS security features
- **VPC Security**: Database isolation in private subnets
- **IAM Integration**: Support for AWS IAM database authentication
- **Encryption**: Support for encryption at rest and in transit
- **Audit Logging**: Complete audit trail for all database operations

## 📊 Performance Features

### Connection Management
```go
// Optimized connection pool settings
db.SetMaxOpenConns(25)        // Maximum open connections
db.SetMaxIdleConns(5)         // Maximum idle connections
db.SetConnMaxLifetime(300s)   // Connection lifetime
```

### Query Optimization
- **Indexed Queries**: Strategic indexing for optimal performance
- **Efficient Filtering**: Optimized search and filter operations
- **Pagination Support**: Efficient handling of large datasets
- **Connection Health**: Automatic connection monitoring and recovery

### Caching Strategy
- **Connection Pooling**: Reuse of database connections
- **Query Optimization**: Efficient PostgreSQL-specific queries
- **Index Utilization**: Proper indexing for common query patterns

## 🚀 Production Deployment

### AWS RDS Configuration
```bash
# Production environment variables
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=borrowhub
DB_USER=borrowhub
DB_PASSWORD=your-secure-password
DB_SSLMODE=require
```

### Migration Management
- **Automatic Migrations**: Built-in migration system
- **Version Tracking**: Database schema version management
- **Rollback Support**: Safe migration rollback capabilities
- **Production Safety**: Transaction-wrapped migrations

### Monitoring and Observability
- **Health Checks**: Database connectivity monitoring
- **Performance Metrics**: Connection pool and query performance
- **Error Tracking**: Comprehensive error logging
- **Audit Trail**: Complete administrative action logging

## 📋 API Integration

### Database Operations
- All CRUD operations use the PostgreSQL database
- Consistent error handling and logging
- Transaction support for data integrity
- Bulk operations for administrative efficiency

### Admin Panel Integration
- Real-time database status monitoring
- Performance metrics dashboard
- Configuration management interface
- Audit log visualization

## 🎯 Benefits of Single Database Approach

### Simplified Architecture
- **Reduced Complexity**: Single database reduces configuration complexity
- **Easier Maintenance**: Simplified debugging and troubleshooting
- **Better Performance**: Optimized for PostgreSQL-specific features
- **Cleaner Code**: Removal of multi-database abstraction layers

### AWS Optimization
- **RDS Native**: Built specifically for AWS RDS deployment
- **Cost Effective**: Single database reduces infrastructure costs
- **Scalable**: Easy scaling with AWS RDS features
- **Reliable**: Leverages AWS RDS reliability and backup features

### Development Experience
- **Faster Setup**: Quick development environment setup
- **Consistent Environment**: Same database in development and production
- **Better Testing**: Simplified testing with single database type
- **Clear Documentation**: Focused documentation without multi-database complexity

## 🔍 Database Schema Details

### Core Tables
```sql
-- Users with role-based access
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) CHECK (role IN ('user', 'admin')),
    status VARCHAR(20) CHECK (status IN ('active', 'suspended', 'banned'))
);

-- Items with approval workflow
CREATE TABLE items (
    id VARCHAR(50) PRIMARY KEY,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')),
    daily_rate DECIMAL(10,2) CHECK (daily_rate >= 0)
);

-- Bookings with payment integration
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    CHECK (end_date > start_date)
);
```

### Indexes and Constraints
- **Performance Indexes**: Strategic indexing for common queries
- **Data Integrity**: Comprehensive foreign key constraints
- **Check Constraints**: Data validation at database level
- **Unique Constraints**: Prevention of duplicate data

This streamlined PostgreSQL implementation provides a robust, secure, and scalable foundation for the BorrowHub application, optimized for AWS deployment and production use.