@echo off
REM SmartEats Quick Deploy Script for Windows
REM Hackathon 2025 - SDG 2 & SDG 3 Solution

echo 🍎 SmartEats Quick Deploy
echo ========================

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is available

REM Check if environment file exists
if not exist ".env.docker" (
    echo ⚠️  Creating environment file from template...
    if exist ".env.example" (
        copy ".env.example" ".env.docker" >nul
        echo 📋 Please update .env.docker with your API keys
    ) else (
        echo ❌ No environment template found
        pause
        exit /b 1
    )
)

echo 🚀 Starting SmartEats services...
docker-compose --env-file .env.docker up -d

if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo ✅ SmartEats deployed successfully!

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Open browser
echo 🌐 Opening SmartEats in your browser...
start http://localhost:5000

echo.
echo 📊 Service Status:
docker-compose --env-file .env.docker ps

echo.
echo 🎯 SmartEats is now running!
echo    Frontend: http://localhost:5000
echo    API Health: http://localhost:5000/api/health
echo.
echo 📝 To stop services: docker-compose --env-file .env.docker down
pause
