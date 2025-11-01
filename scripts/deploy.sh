#!/bin/bash

# ReVerse Deployment Script
# Usage: ./scripts/deploy.sh [OPTIONS]
#
# Options:
#   -d, --domain DOMAIN       Domain name (e.g., reverse.jarv.dev)
#   -p, --port PORT          NextJS port (default: 3000)
#   -s, --secret SECRET      Better Auth secret (will generate if not provided)
#   -k, --api-key KEY        Anthropic API key
#   --db-url URL             Database URL (default: uses docker postgres)
#   --no-build               Skip building images
#   --no-migrate             Skip running migrations
#   -h, --help               Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NEXTJS_PORT=3000
DOMAIN=""
BETTER_AUTH_SECRET=""
ANTHROPIC_API_KEY=""
DATABASE_URL=""
NO_BUILD=false
NO_MIGRATE=false

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to generate a secure random secret
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        # Fallback to /dev/urandom
        LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
${GREEN}ReVerse Deployment Script${NC}

Usage: ./scripts/deploy.sh [OPTIONS]

Options:
  -d, --domain DOMAIN       Domain name (e.g., reverse.jarv.dev) [REQUIRED]
  -p, --port PORT          NextJS port (default: 3000)
  -s, --secret SECRET      Better Auth secret (will generate if not provided)
  -k, --api-key KEY        Anthropic API key [REQUIRED]
  --db-url URL             Database URL (default: uses docker postgres)
  --no-build               Skip building images
  --no-migrate             Skip running migrations
  -h, --help               Show this help message

Examples:
  # Deploy to production with domain
  ./scripts/deploy.sh -d reverse.jarv.dev -k sk-ant-xxx

  # Deploy to custom port with existing secret
  ./scripts/deploy.sh -d myapp.com -p 3001 -s my-secret-key -k sk-ant-xxx

  # Deploy without rebuilding (faster for config-only changes)
  ./scripts/deploy.sh -d reverse.jarv.dev -k sk-ant-xxx --no-build

Environment Variables:
  You can also set these via environment variables:
    DOMAIN, NEXTJS_PORT, BETTER_AUTH_SECRET, ANTHROPIC_API_KEY, DATABASE_URL

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -p|--port)
            NEXTJS_PORT="$2"
            shift 2
            ;;
        -s|--secret)
            BETTER_AUTH_SECRET="$2"
            shift 2
            ;;
        -k|--api-key)
            ANTHROPIC_API_KEY="$2"
            shift 2
            ;;
        --db-url)
            DATABASE_URL="$2"
            shift 2
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --no-migrate)
            NO_MIGRATE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$DOMAIN" ]; then
    print_error "Domain is required!"
    echo ""
    show_usage
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    print_error "Anthropic API key is required!"
    echo ""
    show_usage
    exit 1
fi

# Generate secret if not provided
if [ -z "$BETTER_AUTH_SECRET" ]; then
    print_info "Generating Better Auth secret..."
    BETTER_AUTH_SECRET=$(generate_secret)
    print_success "Generated secret: ${BETTER_AUTH_SECRET:0:8}... (stored in .env.production)"
fi

# Validate secret length
if [ ${#BETTER_AUTH_SECRET} -lt 32 ]; then
    print_error "BETTER_AUTH_SECRET must be at least 32 characters long!"
    exit 1
fi

# Determine protocol and URLs
if [[ "$DOMAIN" == localhost* ]] || [[ "$DOMAIN" == 127.0.0.1* ]]; then
    PROTOCOL="http"
    PASSKEY_RP_ID="localhost"
else
    PROTOCOL="https"
    PASSKEY_RP_ID="$DOMAIN"
fi

BETTER_AUTH_URL="${PROTOCOL}://${DOMAIN}"
NEXT_PUBLIC_BETTER_AUTH_URL="${PROTOCOL}://${DOMAIN}"

# Set default database URL if not provided
if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL="postgresql://postgres:postgres@postgres:5432/appdb"
    print_info "Using default Docker PostgreSQL database"
fi

# Print configuration summary
print_header "📋 Deployment Configuration"
echo "  Domain:              $DOMAIN"
echo "  Protocol:            $PROTOCOL"
echo "  NextJS Port:         $NEXTJS_PORT"
echo "  Auth URL:            $BETTER_AUTH_URL"
echo "  Passkey RP ID:       $PASSKEY_RP_ID"
echo "  Database:            ${DATABASE_URL%%\?*}"  # Hide password
echo "  Auth Secret:         ${BETTER_AUTH_SECRET:0:8}...****"
echo "  Anthropic API Key:   ${ANTHROPIC_API_KEY:0:12}...****"
echo ""

# Create .env.production file
print_header "📝 Creating Environment Configuration"

cat > .env.production << EOF
# Generated by deploy.sh on $(date)
# Domain: $DOMAIN

# Database
DATABASE_URL=$DATABASE_URL

# Better Auth
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=$BETTER_AUTH_URL
NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL

# Passkey Configuration
PASSKEY_RP_ID=$PASSKEY_RP_ID

# AI Configuration
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Node Environment
NODE_ENV=production

# Port Configuration
NEXTJS_PORT=$NEXTJS_PORT
EOF

print_success "Created .env.production"

# Export variables for docker-compose
export DATABASE_URL
export BETTER_AUTH_SECRET
export BETTER_AUTH_URL
export NEXT_PUBLIC_BETTER_AUTH_URL
export PASSKEY_RP_ID
export ANTHROPIC_API_KEY
export NODE_ENV=production
export NEXTJS_PORT

# Stop existing containers
print_header "🛑 Stopping Existing Containers"
docker-compose down 2>/dev/null || true
print_success "Containers stopped"

# Build images
if [ "$NO_BUILD" = false ]; then
    print_header "🔨 Building Docker Images"
    docker-compose build --no-cache
    print_success "Images built successfully"
else
    print_warning "Skipping build (--no-build flag set)"
fi

# Start database
print_header "🚀 Starting Database"
docker-compose up -d postgres
print_info "Waiting for database to be ready..."

# Wait for database to be healthy
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Database failed to start"
    exit 1
fi

# Run migrations
if [ "$NO_MIGRATE" = false ]; then
    print_header "🔄 Running Database Migrations"
    docker-compose up migrations
    print_success "Migrations completed"
else
    print_warning "Skipping migrations (--no-migrate flag set)"
fi

# Start application
print_header "🚀 Starting Application"
docker-compose up -d app
print_success "Application started"

# Wait for app to be ready
print_info "Waiting for application to be ready..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${NEXTJS_PORT}" | grep -q "200\|301\|302"; then
        print_success "Application is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    print_warning "Application may not be ready (timeout waiting for HTTP response)"
    print_info "Check logs with: docker-compose logs -f app"
fi

# Show status
print_header "📊 Deployment Status"
docker-compose ps

# Print success message
print_header "✅ Deployment Complete!"
echo "  🌐 Application URL:    $BETTER_AUTH_URL"
echo "  🔌 Local Access:       http://localhost:$NEXTJS_PORT"
echo ""
echo "  📋 Useful Commands:"
echo "     View logs:          docker-compose logs -f app"
echo "     View all logs:      docker-compose logs -f"
echo "     Restart app:        docker-compose restart app"
echo "     Stop all:           docker-compose down"
echo "     View status:        docker-compose ps"
echo ""

# Test deployment if not localhost
if [[ "$DOMAIN" != localhost* ]] && [[ "$DOMAIN" != 127.0.0.1* ]]; then
    echo "  🧪 Test Deployment:"
    echo "     ./scripts/test-proxy-headers.sh $BETTER_AUTH_URL"
    echo ""
fi

print_success "All done! 🎉"

