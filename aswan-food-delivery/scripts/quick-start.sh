#!/bin/bash

# Aswan Food Delivery - Quick Start Script
# This script quickly sets up and runs the application for development

set -e

echo "🚀 أسوان فود - بدء سريع"
echo "🚀 Aswan Food - Quick Start"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check if this is first run
if [ ! -f "server/.env" ] || [ ! -f "client/.env" ]; then
    print_info "First time setup detected. Running full setup..."
    ./scripts/setup.sh
    echo ""
fi

# Start database and Redis with Docker if not running
print_info "Starting database and Redis..."

# Check if PostgreSQL is running
if ! nc -z localhost 5432 2>/dev/null; then
    print_info "Starting PostgreSQL with Docker..."
    docker run --name aswan-postgres \
        -e POSTGRES_DB=aswan_food_db \
        -e POSTGRES_USER=aswan_user \
        -e POSTGRES_PASSWORD=aswan_password \
        -p 5432:5432 \
        -d postgres:15-alpine || print_warning "PostgreSQL container might already exist"
fi

# Check if Redis is running
if ! nc -z localhost 6379 2>/dev/null; then
    print_info "Starting Redis with Docker..."
    docker run --name aswan-redis \
        -p 6379:6379 \
        -d redis:7-alpine || print_warning "Redis container might already exist"
fi

# Wait for services
print_info "Waiting for services to be ready..."
sleep 5

# Run database migrations and seed
print_info "Setting up database..."
cd server

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    print_info "Generating Prisma client..."
    npx prisma generate
fi

# Run migrations
print_info "Running database migrations..."
npx prisma migrate dev --name init || print_warning "Migrations might already exist"

# Seed database
print_info "Seeding database with sample data..."
npm run seed || print_warning "Database might already be seeded"

cd ..

# Start development servers
print_status "Starting development servers..."
print_info "Backend will run on: http://localhost:5000"
print_info "Frontend will run on: http://localhost:3000"
print_info ""
print_warning "Press Ctrl+C to stop all servers"
print_info ""

# Start both servers concurrently
npm run dev