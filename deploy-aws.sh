#!/bin/bash

# BorrowHub AWS Deployment Script
# This script automates the deployment process for both frontend and backend

set -e

# Configuration
STACK_NAME="borrowhub-app"
S3_DEPLOYMENT_BUCKET="borrowhub-deployment-artifacts"
REGION="us-east-1"
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check SAM CLI
    if ! command -v sam &> /dev/null; then
        log_error "SAM CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check Go
    if ! command -v go &> /dev/null; then
        log_error "Go is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd frontend
    
    # Install dependencies
    npm ci
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    npm run build
    
    log_success "Frontend build completed"
    
    cd ..
}

# Build backend
build_backend() {
    log_info "Building backend..."
    
    cd backend
    
    # Tidy dependencies
    go mod tidy
    
    # Build for Lambda (Linux ARM64)
    GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap main.go
    
    # Create deployment package
    if [ -f bootstrap ]; then
        chmod +x bootstrap
        log_success "Backend build completed"
    else
        log_error "Backend build failed"
        exit 1
    fi
    
    cd ..
}

# Check stack status and handle rollback
check_stack_status() {
    log_info "Checking stack status..."
    
    local status=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${REGION}" \
        --query "Stacks[0].StackStatus" \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    case "$status" in
        "CREATE_COMPLETE"|"UPDATE_COMPLETE")
            log_info "Stack is in healthy state: ${status}"
            ;;
        "UPDATE_ROLLBACK_COMPLETE"|"UPDATE_ROLLBACK_IN_PROGRESS")
            log_warning "Stack is in rollback state: ${status}"
            log_info "This may indicate a previous deployment failure. Proceeding with deployment..."
            ;;
        "UPDATE_ROLLBACK_FAILED"|"CREATE_FAILED"|"UPDATE_FAILED")
            log_error "Stack is in failed state: ${status}"
            log_error "Manual intervention may be required before redeployment"
            return 1
            ;;
        "CREATE_IN_PROGRESS"|"UPDATE_IN_PROGRESS")
            log_warning "Stack operation in progress: ${status}"
            log_warning "Please wait for current operation to complete"
            return 1
            ;;
        "NOT_FOUND")
            log_info "Stack does not exist - this is normal for initial deployment"
            ;;
        *)
            log_warning "Unknown stack status: ${status}"
            ;;
    esac
}

# Create S3 bucket for deployment artifacts if it doesn't exist
create_deployment_bucket() {
    log_info "Checking deployment bucket..."
    
    if ! aws s3 ls "s3://${S3_DEPLOYMENT_BUCKET}" &> /dev/null; then
        log_info "Creating deployment bucket: ${S3_DEPLOYMENT_BUCKET}"
        
        if [ "$REGION" = "us-east-1" ]; then
            aws s3 mb "s3://${S3_DEPLOYMENT_BUCKET}" --region $REGION
        else
            aws s3 mb "s3://${S3_DEPLOYMENT_BUCKET}" --region $REGION --create-bucket-configuration LocationConstraint=$REGION
        fi
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "${S3_DEPLOYMENT_BUCKET}" \
            --versioning-configuration Status=Enabled
            
        log_success "Deployment bucket created"
    else
        log_info "Deployment bucket already exists"
    fi
}

# Validate template before deployment
validate_template() {
    log_info "Validating CloudFormation template..."
    
    cd backend
    
    if sam validate --template-file template.yaml --region "${REGION}" &>/dev/null; then
        log_success "Template validation passed"
    else
        log_error "Template validation failed"
        cd ..
        exit 1
    fi
    
    cd ..
}

# Deploy backend using SAM
deploy_backend() {
    log_info "Deploying backend..."
    
    # Check stack status before deployment
    if aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --region "${REGION}" &> /dev/null; then
        check_stack_status || exit 1
    fi
    
    cd backend
    
    # Build with SAM
    sam build --use-container
    
    # Deploy with SAM
    sam deploy \
        --stack-name "${STACK_NAME}" \
        --s3-bucket "${S3_DEPLOYMENT_BUCKET}" \
        --capabilities CAPABILITY_IAM \
        --region "${REGION}" \
        --parameter-overrides \
            JWTSecret="${JWT_SECRET:-change-this-in-production-jwt-secret-key}" \
        --no-confirm-changeset \
        --no-fail-on-empty-changeset
    
    # Get the API Gateway URL
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${REGION}" \
        --query "Stacks[0].Outputs[?OutputKey=='BorrowHubApi'].OutputValue" \
        --output text)
    
    if [ "$API_URL" != "None" ] && [ "$API_URL" != "" ]; then
        log_success "Backend deployed successfully"
        log_info "API URL: ${API_URL}"
        echo "$API_URL" > ../frontend/.api-url
    else
        log_error "Failed to get API URL from CloudFormation"
        exit 1
    fi
    
    cd ..
}

# Deploy frontend to S3 and CloudFront
deploy_frontend() {
    log_info "Deploying frontend..."
    
    # Get the S3 bucket name from CloudFormation
    S3_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name "${STACK_NAME}" \
        --region "${REGION}" \
        --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ "$S3_BUCKET" = "None" ] || [ "$S3_BUCKET" = "" ]; then
        log_warning "S3 bucket not found in CloudFormation outputs. Creating a separate bucket for frontend..."
        
        S3_BUCKET="${STACK_NAME}-frontend-$(date +%s)"
        
        # Create S3 bucket for frontend
        if [ "$REGION" = "us-east-1" ]; then
            aws s3 mb "s3://${S3_BUCKET}" --region $REGION
        else
            aws s3 mb "s3://${S3_BUCKET}" --region $REGION --create-bucket-configuration LocationConstraint=$REGION
        fi
        
        # Configure bucket for static website hosting
        aws s3 website "s3://${S3_BUCKET}" \
            --index-document index.html \
            --error-document index.html
        
        # Set bucket policy for public read access
        cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${S3_BUCKET}/*"
        }
    ]
}
EOF
        
        aws s3api put-bucket-policy \
            --bucket "${S3_BUCKET}" \
            --policy file://bucket-policy.json
        
        rm bucket-policy.json
    fi
    
    # Update API URL in frontend build if we have it
    if [ -f frontend/.api-url ]; then
        API_URL=$(cat frontend/.api-url)
        log_info "Updating frontend with API URL: ${API_URL}"
        
        # Update the production environment file
        echo "VITE_API_BASE_URL=${API_URL}" > frontend/.env.production.local
    fi
    
    # Rebuild frontend with updated API URL
    cd frontend
    npm run build
    cd ..
    
    # Sync files to S3
    aws s3 sync frontend/dist/ "s3://${S3_BUCKET}" \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "index.html" \
        --exclude "manifest.json" \
        --exclude "sw.js"
    
    # Upload index.html and other files with shorter cache
    aws s3 sync frontend/dist/ "s3://${S3_BUCKET}" \
        --cache-control "max-age=300" \
        --include "index.html" \
        --include "manifest.json" \
        --include "sw.js"
    
    # Get website URL
    WEBSITE_URL="http://${S3_BUCKET}.s3-website-${REGION}.amazonaws.com"
    
    log_success "Frontend deployed successfully"
    log_info "Website URL: ${WEBSITE_URL}"
    
    echo "$WEBSITE_URL" > .website-url
}

# Update CORS configuration with frontend URL
update_cors() {
    if [ -f .website-url ]; then
        WEBSITE_URL=$(cat .website-url)
        log_info "Updating CORS configuration with frontend URL: ${WEBSITE_URL}"
        
        # Note: This would require updating the CloudFormation template
        # For now, we'll just log the information
        log_info "Please update the CORS configuration in template.yaml with:"
        log_info "  AllowOrigin: \"'${WEBSITE_URL}'\""
    fi
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    if [ -f frontend/.api-url ]; then
        API_URL=$(cat frontend/.api-url)
        
        # Test API health endpoint
        if curl -f -s "${API_URL}/health" > /dev/null; then
            log_success "Backend health check passed"
        else
            log_warning "Backend health check failed"
        fi
    fi
    
    if [ -f .website-url ]; then
        WEBSITE_URL=$(cat .website-url)
        
        # Test frontend accessibility
        if curl -f -s "$WEBSITE_URL" > /dev/null; then
            log_success "Frontend health check passed"
        else
            log_warning "Frontend health check failed"
        fi
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f frontend/.api-url
    rm -f .website-url
    rm -f frontend/.env.production.local
}

# Main deployment function
main() {
    log_info "Starting BorrowHub deployment..."
    
    # Set JWT secret if provided
    if [ -z "$JWT_SECRET" ]; then
        log_warning "JWT_SECRET not set. Using default (not recommended for production)"
        export JWT_SECRET="change-this-in-production-jwt-secret-key-$(date +%s)"
    fi
    
    check_prerequisites
    validate_template
    create_deployment_bucket
    build_backend
    deploy_backend
    build_frontend
    deploy_frontend
    update_cors
    health_check
    
    log_success "Deployment completed successfully!"
    
    if [ -f frontend/.api-url ]; then
        API_URL=$(cat frontend/.api-url)
        log_info "API Endpoint: ${API_URL}"
    fi
    
    if [ -f .website-url ]; then
        WEBSITE_URL=$(cat .website-url)
        log_info "Website URL: ${WEBSITE_URL}"
    fi
    
    cleanup
}

# Handle script arguments
case "${1:-}" in
    "frontend")
        build_frontend
        deploy_frontend
        ;;
    "backend")
        build_backend
        deploy_backend
        ;;
    "health")
        health_check
        ;;
    "clean")
        cleanup
        ;;
    *)
        main
        ;;
esac