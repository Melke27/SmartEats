#!/bin/bash

# SmartEats Deployment Script
# Hackathon 2025 - SDG 2 & SDG 3 Solution

set -e

# Default values
ENVIRONMENT="development"
BUILD_FLAG=false
PRODUCTION_FLAG=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--build)
            BUILD_FLAG=true
            shift
            ;;
        -p|--production)
            PRODUCTION_FLAG=true
            ENVIRONMENT="production"
            shift
            ;;
        -h|--help)
            echo "SmartEats Deployment Script"
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -e, --environment ENV    Set environment (development/production)"
            echo "  -b, --build             Build Docker images before deployment"
            echo "  -p, --production        Deploy in production mode"
            echo "  -h, --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                      # Deploy in development mode"
            echo "  $0 --build              # Build and deploy in development"
            echo "  $0 --production         # Deploy in production mode"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

echo "🍎 SmartEats Deployment Script"
echo "================================"

# Check dependencies
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Set environment file
if [[ "$PRODUCTION_FLAG" == true ]]; then
    ENV_FILE=".env.production"
else
    ENV_FILE=".env.docker"
fi

echo "🔧 Environment: $ENVIRONMENT"
echo "📁 Environment file: $ENV_FILE"

# Check if environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "⚠️  Environment file $ENV_FILE not found. Creating from template..."
    if [[ -f ".env.example" ]]; then
        cp ".env.example" "$ENV_FILE"
        echo "📋 Please update $ENV_FILE with your actual configuration values"
        echo "⏸️  Pausing for 5 seconds to allow manual configuration..."
        sleep 5
    else
        echo "❌ No environment template found"
        exit 1
    fi
fi

# Build images if requested
if [[ "$BUILD_FLAG" == true ]]; then
    echo "🔨 Building Docker images..."
    docker-compose --env-file "$ENV_FILE" build
    echo "✅ Build completed successfully"
fi

# Start services
echo "🚀 Starting SmartEats services..."

if [[ "$PRODUCTION_FLAG" == true ]]; then
    # Production deployment with nginx
    docker-compose --env-file "$ENV_FILE" --profile production up -d
else
    # Development deployment
    docker-compose --env-file "$ENV_FILE" up -d
fi

echo "✅ SmartEats deployed successfully!"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check
echo "🔍 Running health check..."
if curl -f http://localhost:5000/api/health &> /dev/null; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check failed. Services may still be starting up."
fi

# Display status
echo ""
echo "📊 Service Status:"
docker-compose --env-file "$ENV_FILE" ps

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:5000"
echo "   API Health: http://localhost:5000/api/health"
if [[ "$PRODUCTION_FLAG" == true ]]; then
    echo "   Nginx Proxy: http://localhost:80"
fi

echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose --env-file $ENV_FILE logs -f"
echo "   Stop services: docker-compose --env-file $ENV_FILE down"
echo "   Restart: docker-compose --env-file $ENV_FILE restart"

echo ""
echo "🎯 SmartEats is now running and ready to address SDG 2 & SDG 3!"
