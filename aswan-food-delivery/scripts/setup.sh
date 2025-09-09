#!/bin/bash

# Aswan Food Delivery - Setup Script
# This script sets up the development environment

set -e

echo "🍕 مرحباً بك في إعداد أسوان فود"
echo "🍕 Welcome to Aswan Food Setup"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18.0 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18.0 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version check passed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "npm version: $(npm --version)"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Make sure PostgreSQL is installed and running."
    print_info "You can use Docker: docker run --name aswan-postgres -e POSTGRES_DB=aswan_food_db -e POSTGRES_USER=aswan_user -e POSTGRES_PASSWORD=aswan_password -p 5432:5432 -d postgres:15"
fi

# Check if Redis is available
if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis client not found. Make sure Redis is installed and running."
    print_info "You can use Docker: docker run --name aswan-redis -p 6379:6379 -d redis:7-alpine"
fi

echo ""
print_info "Setting up Aswan Food Delivery Platform..."

# Install root dependencies
print_info "Installing root dependencies..."
npm install

# Install server dependencies
print_info "Installing server dependencies..."
cd server
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    print_info "Creating server environment file..."
    cp .env.example .env
    print_warning "Please update server/.env with your actual configuration values"
fi

# Generate Prisma client
print_info "Generating Prisma client..."
npx prisma generate

cd ..

# Install client dependencies
print_info "Installing client dependencies..."
cd client
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    print_info "Creating client environment file..."
    cp .env.example .env
    print_warning "Please update client/.env with your actual configuration values"
fi

cd ..

echo ""
print_status "Setup completed successfully! 🎉"
echo ""
print_info "Next steps:"
echo "1. Update environment files:"
echo "   - server/.env"
echo "   - client/.env"
echo ""
echo "2. Set up the database:"
echo "   cd server && npx prisma migrate dev"
echo ""
echo "3. Seed the database with sample data:"
echo "   cd server && npm run seed"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev"
echo ""
echo "5. Open your browser and go to:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Health: http://localhost:5000/health"
echo ""
print_info "Demo login credentials:"
echo "   Customer: customer1@example.com / user123"
echo "   Restaurant Owner: owner1@aswanfood.com / user123"
echo "   Admin: admin@aswanfood.com / admin123"
echo ""
print_status "Happy coding! 🚀"