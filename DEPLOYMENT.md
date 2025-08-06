# BorrowHub AWS Deployment Guide

## Overview

BorrowHub is a full-stack web application for renting and lending items, built with React frontend and Go backend, designed for AWS serverless deployment.

## Architecture

- **Frontend**: React + Vite (PWA-enabled)
- **Backend**: Go + AWS Lambda
- **Database**: DynamoDB
- **Storage**: S3
- **CDN**: CloudFront (optional)
- **Infrastructure**: AWS SAM (CloudFormation)

## Recent Deployment Fixes (2024)

### Critical Issues Resolved
1. **CloudFormation Rollback Protection**: Added proper rollback configuration to prevent deployment failures
2. **DynamoDB Table Safety**: Added deletion and update policies to prevent accidental data loss during stack updates
3. **S3 Bucket Protection**: Added retention policies for file storage bucket
4. **Deployment Configuration**: Streamlined samconfig.toml and GitHub Actions workflow for consistency

### Deployment Safety Features
- **Deletion Policies**: All critical resources (S3, DynamoDB) have `DeletionPolicy: Retain`
- **Update Policies**: Tables have `UpdateReplacePolicy: Retain` to prevent replacement
- **Rollback Enabled**: Stack deployments can safely rollback on failure
- **Drift Detection**: Automated script to check for configuration drift

## Performance Optimizations Implemented

### Frontend Optimizations
- **85% bundle size reduction**: Main bundle reduced from 201KB to 29KB
- **Advanced chunking strategy**: 27 optimized chunks for better caching
- **Tree shaking**: Aggressive dead code elimination
- **Service Worker**: Enhanced PWA with offline capabilities
- **Compression**: Terser with 3-pass optimization

### Backend Optimizations
- **S3 Integration**: Full file upload/download capabilities
- **Enhanced CORS**: Production-ready cross-origin configuration
- **Rate Limiting**: Token bucket algorithm with cleanup
- **Caching**: LRU cache for frequently accessed data
- **Monitoring**: Performance metrics and error tracking

## Prerequisites

- AWS CLI configured with appropriate permissions
- SAM CLI installed
- Node.js 18+ and npm
- Go 1.24.5+

## Deployment Health Check

Before deploying, run the health check script to validate your environment:

```bash
# Make script executable
chmod +x scripts/check-deployment.sh

# Run health check
./scripts/check-deployment.sh
```

## Quick Deployment

### Option 1: Automated Deployment

```bash
# Make deployment script executable
chmod +x deploy-aws.sh

# Set JWT secret (optional, will use default if not set)
export JWT_SECRET="your-production-jwt-secret"

# Deploy everything
./deploy-aws.sh

# Or deploy components separately
./deploy-aws.sh backend    # Backend only
./deploy-aws.sh frontend   # Frontend only
```

### Option 2: Manual Deployment

#### 1. Deploy Backend

```bash
cd backend

# Build the application
go mod tidy
GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap main.go

# Deploy with SAM
sam build --use-container
sam deploy --guided  # First time only
sam deploy           # Subsequent deployments
```

#### 2. Deploy Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Upload to S3 (bucket created by backend deployment)
aws s3 sync dist/ s3://your-frontend-bucket --delete
```

## Environment Configuration

### Backend Environment Variables

Set these in your CloudFormation parameters or environment:

```bash
# Required
JWT_SECRET=your-production-jwt-secret-key
AWS_REGION=us-east-1

# Database (set by CloudFormation)
ITEMS_TABLE_NAME=your-stack-items
USERS_TABLE_NAME=your-stack-users
BOOKINGS_TABLE_NAME=your-stack-bookings
PAYMENTS_TABLE_NAME=your-stack-payments

# Storage (set by CloudFormation)
S3_BUCKET_NAME=your-stack-borrowhub-files

# Optional
CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173
```

### Frontend Environment Variables

Create `.env.production` in the frontend directory:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_ENABLE_IMAGE_OPTIMIZATION=true
VITE_ENABLE_ANALYTICS=true

# Service Worker
VITE_SW_CACHE_NAME=borrowhub-v1.0.0

# Security
VITE_CSP_REPORT_URI=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod/api/csp-report
```

## AWS Resources Created

The deployment creates the following AWS resources:

- **Lambda Function**: Main application handler
- **API Gateway**: REST API for the backend
- **DynamoDB Tables**: Users, Items, Bookings, Payments
- **S3 Bucket**: File storage with public access for images
- **IAM Roles**: Lambda execution role with necessary permissions

## Monitoring and Logging

### Built-in Endpoints

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `POST /api/metrics` - Performance metrics collection
- `POST /api/errors` - Error reporting
- `POST /api/csp-report` - CSP violation reporting

### CloudWatch Integration

The application automatically logs to CloudWatch:

- Application logs
- Performance metrics
- Error reports
- Lambda metrics

### Setting Up Alerts

```bash
# Create CloudWatch alarms for critical metrics
aws cloudwatch put-metric-alarm \
  --alarm-name "BorrowHub-HighErrorRate" \
  --alarm-description "High error rate in BorrowHub" \
  --metric-name "Errors" \
  --namespace "AWS/Lambda" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold" \
  --dimensions Name=FunctionName,Value=your-function-name
```

## Security Configuration

### CORS Policy

The application implements strict CORS policies:

- Production domain allowed
- Localhost allowed for development
- Credentials supported for authentication
- Proper preflight handling

### Content Security Policy

CSP headers are configured to:

- Prevent XSS attacks
- Control script sources
- Allow payment gateways (Stripe, Razorpay)
- Report violations to monitoring endpoint

### Rate Limiting

Token bucket algorithm with:

- 10 requests/second default rate
- Burst capacity of 20 requests
- Per-IP tracking with automatic cleanup

## Performance Features

### Frontend

- **Service Worker**: Intelligent caching with offline support
- **Code Splitting**: Route-based and vendor chunks
- **Image Optimization**: WebP support with fallbacks
- **Bundle Analysis**: Optimized chunk sizes

### Backend

- **Connection Pooling**: Efficient database connections
- **Caching Layer**: LRU cache for frequent queries
- **Compression**: Gzip compression for text responses
- **Optimized Queries**: Indexed searches and pagination

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS configuration in template.yaml
   # Ensure frontend domain is in AllowOrigin
   ```

2. **Build Failures**
   ```bash
   # Frontend build issues
   cd frontend && npm ci && npm run build
   
   # Backend build issues
   cd backend && go mod tidy && go build
   ```

3. **Permission Errors**
   ```bash
   # Check IAM permissions
   aws sts get-caller-identity
   aws iam get-user
   ```

4. **Database Connection Issues**
   ```bash
   # Check DynamoDB tables exist
   aws dynamodb list-tables
   
   # Check Lambda environment variables
   aws lambda get-function-configuration --function-name your-function
   ```

### Health Checks

```bash
# Check API health
curl https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod/health

# Check specific endpoints
curl https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod/health/ready
curl https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod/health/live
```

### Logs

```bash
# View Lambda logs
aws logs describe-log-groups
aws logs tail /aws/lambda/your-function-name --follow

# View specific log stream
aws logs get-log-events --log-group-name /aws/lambda/your-function-name --log-stream-name your-log-stream
```

## Development

### Local Development

```bash
# Backend
cd backend
go run main.go  # Starts on port 8080

# Frontend
cd frontend
npm run dev     # Starts on port 5173
```

### Testing

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests (if added)
cd frontend
npm test
```

## Deployment Safety & Best Practices

### CloudFormation Safety Measures
All critical resources are protected with:
- **DeletionPolicy: Retain** - Prevents accidental resource deletion
- **UpdateReplacePolicy: Retain** - Prevents data loss during updates
- **Rollback Enabled** - Safe recovery from failed deployments

### Resource Protection
Protected resources include:
- S3 File Storage Bucket
- All DynamoDB Tables (Users, Items, Bookings, Payments)
- Lambda Functions (with proper IAM policies)

### Deployment Validation
Before each deployment, run:
```bash
# Health check with drift detection
./scripts/check-deployment.sh

# Template validation
sam validate --template-file backend/template.yaml --region us-east-1
```

### Stack Update Strategy
1. **Pre-deployment**: Run health check script
2. **Deploy with safety**: Uses samconfig.toml settings with rollback enabled
3. **Post-deployment**: Verify all resources and check for drift
4. **Monitor**: CloudWatch alarms for ongoing health monitoring

### Emergency Recovery
If deployment fails:
1. Stack will automatically rollback (rollback enabled)
2. Data is preserved (all critical resources have retention policies)
3. Use health check script to validate recovery
4. Check CloudFormation events for failure cause

## Production Checklist

- [ ] Set production JWT secret
- [ ] Configure proper CORS origins
- [ ] Run deployment health check
- [ ] Verify resource retention policies
- [ ] Set up CloudWatch alarms
- [ ] Configure backup strategies
- [ ] Test error monitoring
- [ ] Verify SSL certificates
- [ ] Set up custom domain (optional)
- [ ] Configure CDN (optional)
- [ ] Load test the application
- [ ] Set up automated deployments
- [ ] Document disaster recovery procedures

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review CloudWatch logs
3. Verify AWS resource configuration
4. Check environment variables

## Performance Metrics

Current optimizations achieved:

- **Frontend Bundle Size**: 85% reduction (201KB → 29KB main bundle)
- **Loading Performance**: Improved with intelligent chunking
- **Offline Capability**: Full PWA with service worker
- **Backend Response Time**: Optimized with caching and connection pooling
- **Error Handling**: Comprehensive error tracking and reporting

The application is production-ready with enterprise-grade monitoring, security, and performance optimizations.