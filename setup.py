#!/usr/bin/env python3
"""
SmartEats Setup Script
Hackathon 2025 - One-click setup for demo
"""

import os
import subprocess
import sys

def print_banner():
    print("🍎" + "="*60 + "🍎")
    print("    SmartEats - Hackathon 2025 Setup")
    print("    SDG 2: Zero Hunger | SDG 3: Good Health")
    print("🍎" + "="*60 + "🍎")

def check_python():
    """Check if Python is installed"""
    try:
        version = sys.version_info
        if version.major >= 3 and version.minor >= 7:
            print("✅ Python version:", f"{version.major}.{version.minor}.{version.micro}")
            return True
        else:
            print("❌ Python 3.7+ required")
            return False
    except Exception as e:
        print("❌ Python check failed:", e)
        return False

def install_requirements():
    """Install Python requirements"""
    try:
        print("📦 Installing Python requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print("❌ Failed to install requirements:", e)
        return False

def setup_environment():
    """Setup environment file"""
    if not os.path.exists('.env'):
        print("⚙️ Creating environment file...")
        with open('.env.example', 'r') as example:
            with open('.env', 'w') as env_file:
                env_file.write(example.read())
        print("✅ Environment file created (.env)")
        print("📝 Please update .env with your database credentials")
    else:
        print("✅ Environment file already exists")

def create_database_setup_sql():
    """Create SQL file for database setup"""
    mysql_sql = """
-- SmartEats MySQL Database Setup
-- Run this in your MySQL server

CREATE DATABASE IF NOT EXISTS smarteats;
USE smarteats;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age INT NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    activity_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition profiles table
CREATE TABLE IF NOT EXISTS nutrition_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    bmi DECIMAL(5,2),
    bmr DECIMAL(7,2),
    tdee DECIMAL(7,2),
    calorie_goal DECIMAL(7,2),
    protein_goal DECIMAL(6,2),
    carb_goal DECIMAL(6,2),
    fat_goal DECIMAL(6,2),
    water_goal DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Meal logs table
CREATE TABLE IF NOT EXISTS meal_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id VARCHAR(50),
    timestamp VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_message TEXT,
    ai_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT IGNORE INTO users (id, age, gender, height, weight, activity_level) VALUES 
(1, 25, 'male', 175, 70, 'moderate');

SELECT 'SmartEats database setup completed!' as status;
"""
    
    with open('database_setup.sql', 'w') as f:
        f.write(mysql_sql)
    print("✅ Database setup SQL created (database_setup.sql)")

def main():
    print_banner()
    
    # Check Python installation
    if not check_python():
        return False
    
    # Install requirements
    if not install_requirements():
        return False
    
    # Setup environment
    setup_environment()
    
    # Create database setup file
    create_database_setup_sql()
    
    print("\n🎉 SmartEats setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update .env with your database credentials")
    print("2. Set up your chosen database (MySQL/MongoDB/Firebase)")
    print("3. Run: python backend/app.py")
    print("4. Open index.html in your browser")
    print("\n🌍 Ready to fight hunger and promote health!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
