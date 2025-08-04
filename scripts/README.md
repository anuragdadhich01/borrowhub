# BorrowHub Deployment Scripts

This directory contains utility scripts for managing and monitoring the BorrowHub deployment on AWS.

## Scripts

### check-deployment.sh

A comprehensive health check script for the CloudFormation stack deployment.

**Features:**
- AWS credentials validation
- Stack existence and status checking
- Configuration drift detection
- Critical resource validation (S3 bucket, API Gateway)
- CloudFormation template validation

**Usage:**
```bash
# Make executable
chmod +x scripts/check-deployment.sh

# Run health check
./scripts/check-deployment.sh
```

**Prerequisites:**
- AWS CLI configured with appropriate permissions
- SAM CLI installed
- Stack deployed in us-east-1 region

**What it checks:**
1. **AWS Credentials** - Validates AWS access
2. **Stack Status** - Checks if BorrowHubStack exists and is healthy
3. **Configuration Drift** - Detects any manual changes to resources
4. **Resource Validation** - Verifies S3 bucket and API Gateway are accessible
5. **Template Validation** - Ensures template.yaml is valid

**Output:**
- ✅ Green: Success/Valid state
- ⚠️ Yellow: Warnings or non-critical issues
- ❌ Red: Errors that need attention

## Adding New Scripts

When adding new scripts to this directory:

1. Make them executable: `chmod +x scripts/your-script.sh`
2. Use the same logging functions for consistency:
   ```bash
   log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
   log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
   log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
   ```
3. Include error handling with `set -e`
4. Document the script in this README
5. Follow the same configuration pattern (stack name, region, etc.)

## Environment Variables

The scripts use these environment variables with defaults:

- `STACK_NAME`: CloudFormation stack name (default: "BorrowHubStack")
- `REGION`: AWS region (default: "us-east-1")
- `TEMPLATE_FILE`: Path to template file (default: "backend/template.yaml")

Override them if needed:
```bash
STACK_NAME=MyStack REGION=us-west-2 ./scripts/check-deployment.sh
```