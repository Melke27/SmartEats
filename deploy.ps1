# SmartEats Deployment Script for Windows
# Hackathon 2025 - SDG 2 & SDG 3 Solution

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Production = $false
)

Write-Host "🍎 SmartEats Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker and Docker Compose are available" -ForegroundColor Green

# Set environment file
if ($Production) {
    $envFile = ".env.production"
    $Environment = "production"
} else {
    $envFile = ".env.docker"
}

Write-Host "🔧 Environment: $Environment" -ForegroundColor Yellow
Write-Host "📁 Environment file: $envFile" -ForegroundColor Yellow

# Check if environment file exists
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  Environment file $envFile not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" $envFile
        Write-Host "📋 Please update $envFile with your actual configuration values" -ForegroundColor Cyan
    } else {
        Write-Host "❌ No environment template found" -ForegroundColor Red
        exit 1
    }
}

# Build images if requested
if ($Build) {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
    docker-compose --env-file $envFile build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
}

# Start services
Write-Host "🚀 Starting SmartEats services..." -ForegroundColor Blue

if ($Production) {
    # Production deployment with nginx
    docker-compose --env-file $envFile --profile production up -d
} else {
    # Development deployment
    docker-compose --env-file $envFile up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SmartEats deployed successfully!" -ForegroundColor Green

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Health check
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "✅ Health check passed: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Health check failed. Services may still be starting up." -ForegroundColor Yellow
}

# Display status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose --env-file $envFile ps

Write-Host ""
Write-Host "🌐 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5000" -ForegroundColor White
Write-Host "   API Health: http://localhost:5000/api/health" -ForegroundColor White
if ($Production) {
    Write-Host "   Nginx Proxy: http://localhost:80" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose --env-file $envFile logs -f" -ForegroundColor White
Write-Host "   Stop services: docker-compose --env-file $envFile down" -ForegroundColor White
Write-Host "   Restart: docker-compose --env-file $envFile restart" -ForegroundColor White

Write-Host ""
Write-Host "🎯 SmartEats is now running and ready to address SDG 2 & SDG 3!" -ForegroundColor Green
