@echo off
echo 🍎============================================================🍎
echo     SmartEats - Hackathon 2025 Demo
echo     SDG 2: Zero Hunger ^| SDG 3: Good Health
echo 🍎============================================================🍎

echo.
echo 🔧 Starting SmartEats backend server...
echo 📊 Backend API: http://localhost:5000
echo 🌐 Frontend will open in your browser automatically
echo.
echo 💡 Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
python backend/app.py

pause
