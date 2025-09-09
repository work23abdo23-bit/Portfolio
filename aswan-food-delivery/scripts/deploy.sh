#!/bin/bash

# Aswan Food Delivery - Deployment Script
# This script builds and deploys the application

set -e

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

echo "🚀 Aswan Food Deployment Script"
echo "🚀 سكريبت نشر أسوان فود"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Build and start services
print_info "Building and starting services..."

# Stop any existing containers
print_info "Stopping existing containers..."
docker-compose down

# Build images
print_info "Building Docker images..."
docker-compose build --no-cache

# Start services
print_info "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_info "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running successfully!"
    
    echo ""
    print_info "Service URLs:"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📊 API Health: http://localhost:5000/health"
    echo "🗄️ PostgreSQL: localhost:5432"
    echo "🔴 Redis: localhost:6379"
    
    echo ""
    print_info "To view logs:"
    echo "docker-compose logs -f [service_name]"
    
    echo ""
    print_info "To stop services:"
    echo "docker-compose down"
    
    echo ""
    print_status "Deployment completed successfully! 🎉"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi