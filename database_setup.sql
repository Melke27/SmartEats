
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
