#!/bin/bash

# CloudFormation Deployment Health Check Script
# This script checks for configuration drift and validates deployment status

set -e

# Configuration
STACK_NAME="BorrowHubStack"
REGION="us-east-1"
TEMPLATE_FILE="backend/template.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
check_aws_credentials() {
    log_info "Checking AWS credentials..."
    if ! aws sts get-caller-identity &>/dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' or set environment variables."
        exit 1
    fi
    log_info "✓ AWS credentials are valid"
}

# Check if stack exists
check_stack_exists() {
    log_info "Checking if stack '$STACK_NAME' exists..."
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &>/dev/null; then
        log_info "✓ Stack '$STACK_NAME' exists"
        return 0
    else
        log_warning "Stack '$STACK_NAME' does not exist"
        return 1
    fi
}

# Get stack status
get_stack_status() {
    local status=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].StackStatus" \
        --output text 2>/dev/null || echo "NOT_FOUND")
    echo "$status"
}

# Check stack status
check_stack_status() {
    log_info "Checking stack status..."
    local status=$(get_stack_status)
    
    case "$status" in
        "CREATE_COMPLETE"|"UPDATE_COMPLETE")
            log_info "✓ Stack is in healthy state: $status"
            ;;
        "CREATE_IN_PROGRESS"|"UPDATE_IN_PROGRESS")
            log_warning "Stack operation in progress: $status"
            ;;
        "CREATE_FAILED"|"UPDATE_FAILED"|"UPDATE_ROLLBACK_COMPLETE"|"UPDATE_ROLLBACK_FAILED")
            log_error "Stack is in failed state: $status"
            return 1
            ;;
        "NOT_FOUND")
            log_warning "Stack does not exist"
            return 1
            ;;
        *)
            log_warning "Unknown stack status: $status"
            ;;
    esac
}

# Check for configuration drift
check_drift() {
    log_info "Checking for configuration drift..."
    
    # Start drift detection
    local drift_id=$(aws cloudformation detect-stack-drift \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "StackDriftDetectionId" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$drift_id" ]; then
        log_error "Failed to start drift detection"
        return 1
    fi
    
    # Wait for drift detection to complete
    log_info "Waiting for drift detection to complete..."
    local status="DETECTION_IN_PROGRESS"
    local attempts=0
    while [ "$status" = "DETECTION_IN_PROGRESS" ] && [ $attempts -lt 30 ]; do
        sleep 5
        status=$(aws cloudformation describe-stack-drift-detection-status \
            --stack-drift-detection-id "$drift_id" \
            --region "$REGION" \
            --query "DetectionStatus" \
            --output text)
        ((attempts++))
    done
    
    if [ "$status" != "DETECTION_COMPLETE" ]; then
        log_error "Drift detection timed out or failed: $status"
        return 1
    fi
    
    # Get drift results
    local drift_status=$(aws cloudformation describe-stack-drift-detection-status \
        --stack-drift-detection-id "$drift_id" \
        --region "$REGION" \
        --query "StackDriftStatus" \
        --output text)
    
    case "$drift_status" in
        "IN_SYNC")
            log_info "✓ No configuration drift detected"
            ;;
        "DRIFTED")
            log_warning "⚠️  Configuration drift detected!"
            log_info "Run 'aws cloudformation describe-stack-resource-drifts --stack-name $STACK_NAME --region $REGION' for details"
            ;;
        *)
            log_warning "Unknown drift status: $drift_status"
            ;;
    esac
}

# Validate resources
validate_resources() {
    log_info "Validating critical resources..."
    
    # Check S3 bucket
    local bucket_name=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$bucket_name" ] && [ "$bucket_name" != "None" ]; then
        if aws s3 ls "s3://$bucket_name" &>/dev/null; then
            log_info "✓ S3 bucket '$bucket_name' is accessible"
        else
            log_error "S3 bucket '$bucket_name' is not accessible"
        fi
    else
        log_warning "S3 bucket name not found in stack outputs"
    fi
    
    # Check API Gateway
    local api_url=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='BorrowHubApi'].OutputValue" \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$api_url" ] && [ "$api_url" != "None" ]; then
        log_info "✓ API Gateway endpoint: $api_url"
        # Test if API is responding (basic connectivity check)
        if curl -s --connect-timeout 10 "$api_url/health" &>/dev/null || 
           curl -s --connect-timeout 10 "$api_url" &>/dev/null; then
            log_info "✓ API Gateway is responding"
        else
            log_warning "API Gateway may not be responding (this could be normal if no health endpoint exists)"
        fi
    else
        log_warning "API Gateway URL not found in stack outputs"
    fi
}

# Validate template
validate_template() {
    log_info "Validating CloudFormation template..."
    if [ -f "$TEMPLATE_FILE" ]; then
        if sam validate --template-file "$TEMPLATE_FILE" --region "$REGION" &>/dev/null; then
            log_info "✓ Template is valid"
        else
            log_error "Template validation failed"
            return 1
        fi
    else
        log_error "Template file not found: $TEMPLATE_FILE"
        return 1
    fi
}

# Main execution
main() {
    log_info "Starting CloudFormation deployment health check..."
    echo "========================================================"
    
    check_aws_credentials
    
    if check_stack_exists; then
        check_stack_status
        check_drift
        validate_resources
    else
        log_info "Stack does not exist - this is normal for initial deployment"
    fi
    
    validate_template
    
    echo "========================================================"
    log_info "Health check completed"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi