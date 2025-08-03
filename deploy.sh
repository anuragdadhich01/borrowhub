#!/bin/bash

# BorrowHub Deployment Script
# Builds the frontend and prepares it for production deployment

set -e

echo "🚀 Starting BorrowHub deployment preparation..."

# Change to frontend directory
cd "$(dirname "$0")/frontend"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Copy icons to dist (in case they're not automatically copied)
echo "🎨 Copying PWA icons..."
cp -r public/icons dist/ 2>/dev/null || echo "Icons already copied"

# Copy .htaccess for Apache servers
echo "⚙️ Copying Apache configuration..."
cp ../.htaccess dist/

# Copy offline.html (in case it's not automatically copied)
echo "📄 Ensuring offline page is available..."
cp public/offline.html dist/ 2>/dev/null || echo "Offline page already copied"

# Create a simple deployment info file
echo "📝 Creating deployment info..."
cat > dist/deployment-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "$(date +%Y%m%d-%H%M%S)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "environment": "production"
}
EOF

# List the contents of dist directory
echo "📋 Build contents:"
ls -la dist/

echo "✅ Build completed successfully!"
echo ""
echo "📁 Deployment files are ready in: $(pwd)/dist/"
echo ""
echo "🌐 Next steps:"
echo "1. Upload the contents of the 'dist' directory to your web server"
echo "2. Configure your server (Apache/Nginx) with the provided configuration files"
echo "3. Ensure SSL certificates are properly configured"
echo "4. Test the deployment with the PWA icons and offline functionality"
echo ""
echo "⚡ Server configurations available:"
echo "   - Apache: dist/.htaccess (already copied)"
echo "   - Nginx: ../nginx.conf (reference configuration)"
echo ""

# Calculate bundle sizes
echo "📊 Bundle analysis:"
echo "   Total build size: $(du -sh dist/ | cut -f1)"
echo "   JavaScript bundle size: $(du -sh dist/assets/*.js | tail -1 | cut -f1)"
echo "   CSS bundle size: $(du -sh dist/assets/*.css | tail -1 | cut -f1)"
echo "   Icons size: $(du -sh dist/icons/ | cut -f1)"

echo "🎉 Deployment preparation complete!"