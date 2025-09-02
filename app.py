"""
SmartEats Backend API Server
Hackathon 2025 - SDG 2 & SDG 3 Solution
Advanced Flask API with AI, Community, and Wellness Features
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import sqlite3
import os
import json
import random
import re
import requests
from dataclasses import dataclass
from typing import List, Dict, Optional

# Initialize Flask app
app = Flask(__name__)

# Production-ready configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'smarteats-hackathon-2025-sdg-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///smarteats.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('SECRET_KEY', 'jwt-secret-smarteats-2025')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:5500", "*"])

# ===== DATABASE MODELS =====

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_premium = db.Column(db.Boolean, default=False)
    
    # Relationships
    profiles = db.relationship('UserProfile', backref='user', lazy=True)
    meals = db.relationship('MealLog', backref='user', lazy=True)
    achievements = db.relationship('UserAchievement', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    height = db.Column(db.Float)  # in cm
    weight = db.Column(db.Float)  # in kg
    activity_level = db.Column(db.String(20))
    dietary_restrictions = db.Column(db.Text)  # JSON string
    health_goals = db.Column(db.Text)  # JSON string
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class NutritionPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    calories = db.Column(db.Float)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fat = db.Column(db.Float)
    water = db.Column(db.Float)
    bmr = db.Column(db.Float)
    tdee = db.Column(db.Float)
    bmi = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MealLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    meal_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Float)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fat = db.Column(db.Float)
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    badge_emoji = db.Column(db.String(10))
    points = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50))

class UserAchievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

class CommunityPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    category = db.Column(db.String(50))  # recipe, tip, success_story, question
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ===== NUTRITION CALCULATOR =====

class NutritionCalculator:
    @staticmethod
    def calculate_bmr(weight, height, age, gender):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if gender.lower() == 'male':
            return 10 * weight + 6.25 * height - 5 * age + 5
        else:
            return 10 * weight + 6.25 * height - 5 * age - 161
    
    @staticmethod
    def calculate_tdee(bmr, activity_level):
        """Calculate Total Daily Energy Expenditure"""
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'very': 1.725,
            'extra': 1.9
        }
        return bmr * activity_multipliers.get(activity_level, 1.2)
    
    @staticmethod
    def calculate_macros(tdee, weight, goal='maintain'):
        """Calculate macronutrient needs"""
        if goal == 'lose':
            calories = tdee - 500
        elif goal == 'gain':
            calories = tdee + 300
        else:
            calories = tdee
        
        protein = weight * 2.2  # 2.2g per kg
        fat = calories * 0.25 / 9  # 25% of calories from fat
        carbs = (calories - (protein * 4) - (fat * 9)) / 4
        water = weight * 0.035  # 35ml per kg
        
        return {
            'calories': round(calories),
            'protein': round(protein),
            'carbs': round(carbs),
            'fat': round(fat),
            'water': round(water, 1)
        }

# ===== AI CHAT SYSTEM =====

class AINutritionBot:
    def __init__(self):
        self.language_patterns = {
            'ar': re.compile(r'[؀-ۿ]'),
            'am': re.compile(r'[ሀ-፿]'),
            'sw': re.compile(r'\b(habari|chakula|afya|maji|protein)\b', re.I),
            'fr': re.compile(r'\b(bonjour|nutrition|santé|eau|protéine)\b', re.I),
            'es': re.compile(r'\b(hola|nutrición|salud|agua|proteína)\b', re.I),
            'hi': re.compile(r'[ऀ-ॿ]'),
            'zh': re.compile(r'[一-鿿]'),
            'ja': re.compile(r'[぀-ゟ゠-ヿ一-龯]'),
            'ko': re.compile(r'[가-힯]'),
            'ru': re.compile(r'[Ѐ-ӿ]'),
        }
        
        self.nutrition_keywords = {
            'protein': ['protein', 'protien', 'muscle', 'amino', 'meat', 'fish', 'eggs'],
            'weight_loss': ['lose weight', 'diet', 'slim', 'fat loss', 'calories'],
            'hydration': ['water', 'hydration', 'drink', 'thirsty', 'dehydrated'],
            'energy': ['energy', 'tired', 'fatigue', 'boost', 'stamina'],
            'vitamins': ['vitamins', 'minerals', 'nutrients', 'deficiency'],
            'meal_planning': ['meal plan', 'recipes', 'cooking', 'food prep'],
            'diabetes': ['diabetes', 'blood sugar', 'glucose', 'insulin'],
            'heart_health': ['heart', 'cholesterol', 'blood pressure', 'cardiovascular']
        }
    
    def detect_language(self, message):
        for lang, pattern in self.language_patterns.items():
            if pattern.search(message):
                return lang
        return 'en'
    
    def detect_intent(self, message):
        message_lower = message.lower()
        for intent, keywords in self.nutrition_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        return 'general'
    
    def generate_response(self, message, user_profile=None):
        language = self.detect_language(message)
        intent = self.detect_intent(message)
        
        # Get personalized response based on user profile
        if user_profile:
            return self.get_personalized_response(intent, language, user_profile)
        
        return self.get_general_response(intent, language)
    
    def get_personalized_response(self, intent, language, profile):
        responses = {
            'protein': {
                'en': f"Based on your {profile.get('weight', 70)}kg weight, you need about {round(profile.get('weight', 70) * 2.2)}g protein daily. Great sources include lean meats, fish, eggs, and legumes!",
                'es': f"Basado en tu peso de {profile.get('weight', 70)}kg, necesitas aproximadamente {round(profile.get('weight', 70) * 2.2)}g de proteína diariamente.",
                'fr': f"Basé sur votre poids de {profile.get('weight', 70)}kg, vous avez besoin d'environ {round(profile.get('weight', 70) * 2.2)}g de protéines par jour."
            },
            'weight_loss': {
                'en': f"For healthy weight loss, aim for a deficit of 300-500 calories from your maintenance level. Stay consistent and patient!",
                'es': f"Para una pérdida de peso saludable, apunta a un déficit de 300-500 calorías de tu nivel de mantenimiento.",
                'fr': f"Pour une perte de poids saine, visez un déficit de 300-500 calories par rapport à votre niveau de maintenance."
            }
        }
        
        return responses.get(intent, {}).get(language, 
            "I'm here to help with your nutrition journey! Ask me about protein, weight management, hydration, or meal planning.")

    def get_general_response(self, intent, language):
        responses = {
            'protein': {
                'en': "🥩 Protein is essential for muscle building and repair! Aim for 0.8-2.2g per kg body weight. Great sources: lean meats, fish, eggs, dairy, legumes, and quinoa.",
                'es': "🥩 ¡La proteína es esencial para construir y reparar músculos! Apunta a 0.8-2.2g por kg de peso corporal.",
                'fr': "🥩 Les protéines sont essentielles pour la construction et la réparation musculaire! Visez 0,8-2,2g par kg de poids corporel."
            },
            'hydration': {
                'en': "💧 Stay hydrated! Aim for 8-10 glasses (2-3L) of water daily. More if you're active or in hot weather. Your urine should be pale yellow.",
                'es': "💧 ¡Mantente hidratado! Apunta a 8-10 vasos (2-3L) de agua diariamente.",
                'fr': "💧 Restez hydraté! Visez 8-10 verres (2-3L) d'eau par jour."
            },
            'general': {
                'en': "🍎 I'm your AI nutrition assistant! I can help with meal planning, macro calculations, healthy recipes, and wellness tips. What would you like to know?",
                'es': "🍎 ¡Soy tu asistente nutricional AI! Puedo ayudar con planificación de comidas, cálculos de macros, recetas saludables y consejos de bienestar.",
                'fr': "🍎 Je suis votre assistant nutritionnel IA! Je peux aider avec la planification des repas, les calculs de macros, les recettes saines et les conseils de bien-être."
            }
        }
        
        return responses.get(intent, responses['general']).get(language, responses.get(intent, responses['general'])['en'])

# Initialize AI bot
ai_bot = AINutritionBot()

# ===== API ROUTES =====

@app.route('/')
def home():
    """Serve the frontend HTML"""
    return send_from_directory('.', 'index.html')

@app.route('/api')
def api_health():
    """API health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'SmartEats API is running!',
        'version': '2.0.0',
        'sdg_goals': ['SDG 2: Zero Hunger', 'SDG 3: Good Health and Well-Being'],
        'features': [
            'Nutrition Calculator',
            'AI Chat Assistant', 
            'Meal Logging',
            'Community Features',
            'Wellness Tracking',
            'Sustainability Metrics'
        ],
        'endpoints': {
            'auth': '/api/auth/login, /api/auth/register',
            'nutrition': '/api/nutrition/calculate, /api/nutrition/lookup',
            'meals': '/api/meals/log, /api/meals/today',
            'chat': '/api/chat',
            'wellness': '/api/wellness/sleep-stress',
            'community': '/api/community/leaderboard, /api/challenges/weekly'
        },
        'status': 'healthy'
    })

# ===== IMAGE ROUTES =====

@app.route('/images/<path:filepath>')
def serve_images(filepath):
    """Serve images from the images directory"""
    return send_from_directory('images', filepath)

@app.route('/api/images/upload', methods=['POST'])
@jwt_required()
def upload_image():
    """Handle image uploads"""
    try:
        user_id = get_jwt_identity()
        
        # Check if image file is in request
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp', 'svg'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400
        
        # Generate unique filename
        import uuid
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        
        # Save to uploads directory
        import os
        upload_path = os.path.join('images', 'uploads', unique_filename)
        file.save(upload_path)
        
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'image_url': f'/images/uploads/{unique_filename}',
            'filename': unique_filename
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/images/list')
def list_images():
    """List available images by category"""
    try:
        import os
        images = {
            'logos': [],
            'icons': [],
            'foods': [],
            'uploads': []
        }
        
        for category in images.keys():
            category_path = os.path.join('images', category)
            if os.path.exists(category_path):
                for filename in os.listdir(category_path):
                    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg')):
                        images[category].append({
                            'filename': filename,
                            'url': f'/images/{category}/{filename}'
                        })
        
        return jsonify({
            'success': True,
            'images': images
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

# ===== AUTHENTICATION ROUTES =====

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        if not all(k in data for k in ('name', 'email', 'password')):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
        
        # Create user
        user = User(
            name=data['name'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            },
            'access_token': access_token
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'is_premium': user.is_premium
                },
                'access_token': access_token
            })
        
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== NUTRITION ROUTES =====

@app.route('/api/nutrition/calculate', methods=['POST'])
@jwt_required()
def calculate_nutrition():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Calculate BMR and TDEE
        bmr = NutritionCalculator.calculate_bmr(
            data['weight'], data['height'], data['age'], data['gender']
        )
        tdee = NutritionCalculator.calculate_tdee(bmr, data['activity'])
        
        # Calculate BMI
        height_m = data['height'] / 100
        bmi = data['weight'] / (height_m * height_m)
        
        # Calculate macros
        macros = NutritionCalculator.calculate_macros(tdee, data['weight'])
        
        # Save to database
        nutrition_plan = NutritionPlan(
            user_id=user_id,
            calories=macros['calories'],
            protein=macros['protein'],
            carbs=macros['carbs'],
            fat=macros['fat'],
            water=macros['water'],
            bmr=bmr,
            tdee=tdee,
            bmi=round(bmi, 1)
        )
        
        # Update user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id)
        
        profile.age = data['age']
        profile.gender = data['gender']
        profile.height = data['height']
        profile.weight = data['weight']
        profile.activity_level = data['activity']
        profile.updated_at = datetime.utcnow()
        
        db.session.add(nutrition_plan)
        db.session.add(profile)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': {
                'bmi': round(bmi, 1),
                'bmr': round(bmr),
                'tdee': round(tdee),
                'calories': macros['calories'],
                'protein': macros['protein'],
                'carbs': macros['carbs'],
                'fat': macros['fat'],
                'water': macros['water']
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/nutrition/lookup', methods=['POST'])
def nutrition_lookup():
    try:
        data = request.get_json()
        food_name = data.get('food', '').lower()
        
        # Sample nutrition database (in production, use a real API like USDA)
        nutrition_db = {
            'banana': {'calories': 105, 'protein': 1.3, 'carbs': 27, 'fat': 0.3, 'fiber': 3.1},
            'apple': {'calories': 95, 'protein': 0.5, 'carbs': 25, 'fat': 0.3, 'fiber': 4.4},
            'chicken breast': {'calories': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6, 'fiber': 0},
            'salmon': {'calories': 208, 'protein': 22, 'carbs': 0, 'fat': 12, 'fiber': 0},
            'rice': {'calories': 130, 'protein': 2.7, 'carbs': 28, 'fat': 0.3, 'fiber': 0.4},
            'broccoli': {'calories': 34, 'protein': 2.8, 'carbs': 7, 'fat': 0.4, 'fiber': 2.6},
            'egg': {'calories': 155, 'protein': 13, 'carbs': 1.1, 'fat': 11, 'fiber': 0},
            'oats': {'calories': 389, 'protein': 17, 'carbs': 66, 'fat': 7, 'fiber': 10.6}
        }
        
        # Find closest match
        nutrition = nutrition_db.get(food_name)
        if not nutrition:
            # Find partial matches
            for food, data in nutrition_db.items():
                if food in food_name or food_name in food:
                    nutrition = data
                    break
        
        if not nutrition:
            nutrition = {'calories': 100, 'protein': 5, 'carbs': 15, 'fat': 3, 'fiber': 2}
        
        return jsonify({
            'success': True,
            'nutrition': {
                **nutrition,
                'serving_qty': 100,
                'serving_unit': 'grams',
                'source': 'SmartEats Database'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== MEAL LOGGING ROUTES =====

@app.route('/api/meals/log', methods=['POST'])
@jwt_required()
def log_meal():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        meal = MealLog(
            user_id=user_id,
            meal_name=data.get('meal_name', 'Unknown'),
            calories=data.get('calories', 0),
            protein=data.get('protein', 0),
            carbs=data.get('carbs', 0),
            fat=data.get('fat', 0),
            meal_type=data.get('meal_type', 'snack')
        )
        
        db.session.add(meal)
        db.session.commit()
        
        # Check for achievements
        check_meal_achievements(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Meal logged successfully',
            'meal_id': meal.id
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/meals/today', methods=['GET'])
@jwt_required()
def get_todays_meals():
    try:
        user_id = get_jwt_identity()
        today = datetime.utcnow().date()
        
        meals = MealLog.query.filter(
            MealLog.user_id == user_id,
            db.func.date(MealLog.logged_at) == today
        ).all()
        
        total_calories = sum(meal.calories or 0 for meal in meals)
        total_protein = sum(meal.protein or 0 for meal in meals)
        
        return jsonify({
            'success': True,
            'meals': [{
                'id': meal.id,
                'name': meal.meal_name,
                'calories': meal.calories,
                'protein': meal.protein,
                'type': meal.meal_type,
                'time': meal.logged_at.isoformat()
            } for meal in meals],
            'totals': {
                'calories': total_calories,
                'protein': total_protein,
                'meal_count': len(meals)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== AI CHAT ROUTES =====

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        # Get user profile if authenticated
        user_profile = None
        try:
            user_id = get_jwt_identity()
            if user_id:
                profile = UserProfile.query.filter_by(user_id=user_id).first()
                if profile:
                    user_profile = {
                        'weight': profile.weight,
                        'height': profile.height,
                        'age': profile.age,
                        'gender': profile.gender
                    }
        except:
            pass  # User not authenticated
        
        response = ai_bot.generate_response(message, user_profile)
        
        return jsonify({
            'success': True,
            'response': response,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== RECIPE SEARCH ROUTES =====

@app.route('/api/recipes/search', methods=['POST'])
def search_recipes():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '')
        
        # Sample recipe database
        recipes = [
            {
                'id': 'protein-bowl',
                'name': 'High-Protein Power Bowl',
                'description': 'Quinoa bowl with grilled chicken, roasted vegetables, and tahini dressing',
                'ingredients': ['quinoa', 'chicken', 'broccoli', 'sweet potato', 'tahini'],
                'calories': 520,
                'protein': 35,
                'prep_time': 25,
                'difficulty': 'medium',
                'image': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop'
            },
            {
                'id': 'salmon-avocado',
                'name': 'Baked Salmon with Avocado Salsa',
                'description': 'Heart-healthy omega-3 rich salmon with fresh avocado salsa',
                'ingredients': ['salmon', 'avocado', 'tomato', 'lime', 'cilantro'],
                'calories': 380,
                'protein': 28,
                'prep_time': 20,
                'difficulty': 'easy',
                'image': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop'
            },
            {
                'id': 'veggie-stir-fry',
                'name': 'Colorful Vegetable Stir-fry',
                'description': 'Nutrient-packed mixed vegetables with ginger-soy sauce',
                'ingredients': ['broccoli', 'bell pepper', 'carrot', 'ginger', 'soy sauce'],
                'calories': 220,
                'protein': 12,
                'prep_time': 15,
                'difficulty': 'easy',
                'image': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop'
            }
        ]
        
        # Filter recipes based on ingredients
        ingredient_list = [ing.strip().lower() for ing in ingredients.split(',')]
        filtered_recipes = []
        
        for recipe in recipes:
            # Check if any ingredient matches
            if any(ing in ' '.join(recipe['ingredients']).lower() for ing in ingredient_list):
                filtered_recipes.append(recipe)
        
        # If no matches, return all recipes
        if not filtered_recipes:
            filtered_recipes = recipes
        
        return jsonify({
            'success': True,
            'recipes': filtered_recipes[:6],  # Limit to 6 recipes
            'total': len(filtered_recipes)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== WELLNESS ROUTES =====

@app.route('/api/wellness/sleep-stress', methods=['POST'])
@jwt_required()
def track_wellness():
    try:
        data = request.get_json()
        sleep_hours = data.get('sleep_hours', 8)
        stress_level = data.get('stress_level', 5)
        
        # Calculate wellness score
        sleep_score = min(50, (sleep_hours / 8) * 50)
        stress_score = max(0, 50 - (stress_level * 5))
        wellness_score = round(sleep_score + stress_score)
        
        # Generate recommendations
        recommendations = []
        
        if sleep_hours < 7:
            recommendations.append({
                'message': '💤 Try to get 7-9 hours of sleep for optimal recovery',
                'action': 'Consider magnesium-rich foods like almonds before bed'
            })
        elif sleep_hours > 9:
            recommendations.append({
                'message': '⏰ Too much sleep can indicate underlying issues',
                'action': 'Maintain consistent sleep schedule and check with healthcare provider'
            })
        else:
            recommendations.append({
                'message': '🌟 Excellent sleep habits! Keep it up',
                'action': 'Continue your healthy sleep routine'
            })
        
        if stress_level > 7:
            recommendations.append({
                'message': '😰 High stress can impact your nutrition goals',
                'action': 'Try stress-reducing foods like dark chocolate, green tea, and omega-3 rich fish'
            })
        elif stress_level < 3:
            recommendations.append({
                'message': '😌 Great stress management! You\'re doing well',
                'action': 'Keep up your stress management techniques'
            })
        
        return jsonify({
            'success': True,
            'wellness_score': wellness_score,
            'recommendations': recommendations,
            'breakdown': {
                'sleep_score': round(sleep_score),
                'stress_score': round(stress_score)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== COMMUNITY ROUTES =====

@app.route('/api/community/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Sample leaderboard data (in production, calculate from actual user data)
        leaderboard = [
            {'rank': 1, 'username': 'HealthHero123', 'score': 2850, 'streak': 28, 'badge': '🏆'},
            {'rank': 2, 'username': 'NutritioNinja', 'score': 2650, 'streak': 21, 'badge': '🥈'},
            {'rank': 3, 'username': 'WellnessWarrior', 'score': 2480, 'streak': 18, 'badge': '🥉'},
            {'rank': 4, 'username': 'FitnessFanatic', 'score': 2320, 'streak': 15, 'badge': '⭐'},
            {'rank': 5, 'username': 'HealthyHabits', 'score': 2180, 'streak': 12, 'badge': '⭐'},
            {'rank': 6, 'username': 'VeggieLover99', 'score': 2050, 'streak': 9, 'badge': '⭐'},
            {'rank': 7, 'username': 'ProteinPowerFan', 'score': 1920, 'streak': 7, 'badge': '⭐'},
            {'rank': 8, 'username': 'CleanEating101', 'score': 1850, 'streak': 5, 'badge': '⭐'}
        ]
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard,
            'updated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/challenges/weekly', methods=['GET'])
def get_weekly_challenges():
    try:
        challenges = [
            {
                'id': 'hydration-hero',
                'title': '💧 Hydration Hero',
                'description': 'Drink 8+ glasses of water daily for 7 days',
                'progress': random.randint(3, 6),
                'target': 7,
                'reward': '50 points + Hydration Badge',
                'category': 'wellness',
                'expires_at': (datetime.utcnow() + timedelta(days=4)).isoformat()
            },
            {
                'id': 'veggie-champion',
                'title': '🥬 Veggie Champion',
                'description': 'Eat 5+ servings of vegetables daily',
                'progress': random.randint(2, 5),
                'target': 7,
                'reward': '75 points + Veggie Badge',
                'category': 'nutrition',
                'expires_at': (datetime.utcnow() + timedelta(days=4)).isoformat()
            },
            {
                'id': 'protein-power',
                'title': '🥩 Protein Power',
                'description': 'Meet your daily protein goals for 5 days',
                'progress': random.randint(2, 4),
                'target': 5,
                'reward': '60 points + Protein Badge',
                'category': 'nutrition',
                'expires_at': (datetime.utcnow() + timedelta(days=4)).isoformat()
            },
            {
                'id': 'meal-master',
                'title': '🍽️ Meal Master',
                'description': 'Log 3 complete meals daily for 7 days',
                'progress': random.randint(4, 6),
                'target': 7,
                'reward': '80 points + Meal Master Badge',
                'category': 'tracking',
                'expires_at': (datetime.utcnow() + timedelta(days=4)).isoformat()
            }
        ]
        
        return jsonify({
            'success': True,
            'challenges': challenges,
            'updated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== SUSTAINABILITY ROUTES =====

@app.route('/api/sustainability/score', methods=['POST'])
def calculate_sustainability_score():
    try:
        data = request.get_json()
        meals = data.get('meals', [])
        
        # Calculate sustainability based on meal choices
        plant_based_keywords = ['vegetable', 'fruit', 'grain', 'legume', 'quinoa', 'salad', 'tofu']
        sustainable_keywords = ['local', 'organic', 'seasonal', 'plant']
        
        total_meals = len(meals)
        if total_meals == 0:
            return jsonify({'success': False, 'message': 'No meals provided'}), 400
        
        plant_based_count = 0
        sustainable_count = 0
        
        for meal in meals:
            meal_name = meal.get('name', '').lower()
            if any(keyword in meal_name for keyword in plant_based_keywords):
                plant_based_count += 1
            if any(keyword in meal_name for keyword in sustainable_keywords):
                sustainable_count += 1
        
        # Calculate scores
        plant_score = (plant_based_count / total_meals) * 60
        sustainable_score = (sustainable_count / total_meals) * 40
        sustainability_score = round(plant_score + sustainable_score)
        
        # Calculate environmental impact
        base_carbon = 2.5  # kg CO2 per day
        carbon_reduction = sustainability_score * 0.02
        carbon_footprint = round(max(0.5, base_carbon - carbon_reduction), 1)
        
        base_water = 1000  # liters per day
        water_reduction = sustainability_score * 8
        water_usage = round(max(200, base_water - water_reduction))
        
        # Generate recommendations
        recommendations = []
        if sustainability_score < 40:
            recommendations.extend([
                '🌱 Try incorporating more plant-based proteins like lentils and quinoa',
                '🥬 Add more vegetables to each meal',
                '♻️ Choose locally sourced and seasonal produce when possible'
            ])
        elif sustainability_score < 70:
            recommendations.extend([
                '🌟 Good progress! Try one meat-free day per week',
                '🌍 Look for organic and sustainably sourced options',
                '💧 Consider water usage when choosing ingredients'
            ])
        else:
            recommendations.extend([
                '🏆 Excellent sustainability choices!',
                '🌍 You\'re making a positive impact on the environment',
                '💚 Keep up the great work with eco-friendly eating'
            ])
        
        return jsonify({
            'success': True,
            'sustainability_score': sustainability_score,
            'carbon_footprint': carbon_footprint,
            'water_usage': water_usage,
            'recommendations': recommendations,
            'breakdown': {
                'plant_based_meals': plant_based_count,
                'total_meals': total_meals,
                'plant_percentage': round((plant_based_count / total_meals) * 100)
            },
            'sdg_impact': 'Contributing to SDG 12: Responsible Consumption and Production'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== GROCERY LIST ROUTES =====

@app.route('/api/grocery/generate-list', methods=['POST'])
@jwt_required()
def generate_grocery_list():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        days = data.get('days', 7)
        
        # Get user's dietary restrictions
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        dietary_restrictions = []
        if profile and profile.dietary_restrictions:
            dietary_restrictions = json.loads(profile.dietary_restrictions)
        
        # Generate grocery list based on nutritional needs
        grocery_list = {
            'proteins': [
                'Chicken breast (1kg)',
                'Salmon fillet (500g)',
                'Eggs (12 pack)',
                'Greek yogurt (750g)',
                'Lean ground turkey (500g)',
                'Cottage cheese (500g)'
            ],
            'vegetables': [
                'Mixed leafy greens (300g)',
                'Broccoli (400g)',
                'Bell peppers (4 pieces)',
                'Tomatoes (750g)',
                'Carrots (500g)',
                'Onions (3 pieces)',
                'Garlic (1 bulb)'
            ],
            'fruits': [
                'Bananas (8 pieces)',
                'Apples (6 pieces)',
                'Mixed berries (300g)',
                'Avocados (4 pieces)',
                'Oranges (6 pieces)',
                'Lemons (3 pieces)'
            ],
            'grains': [
                'Brown rice (1kg)',
                'Quinoa (500g)',
                'Whole grain bread (2 loaves)',
                'Oats (750g)',
                'Whole wheat pasta (500g)'
            ],
            'dairy': [
                'Milk (2L)',
                'Low-fat cheese (300g)',
                'Plain Greek yogurt (1kg)'
            ],
            'pantry': [
                'Extra virgin olive oil (500ml)',
                'Mixed nuts (250g)',
                'Almond butter (300g)',
                'Raw honey (250g)',
                'Herbs & spices variety pack',
                'Canned beans (3 cans)'
            ]
        }
        
        # Adjust for dietary restrictions
        if 'vegan' in dietary_restrictions:
            grocery_list['proteins'] = [
                'Tofu (600g)',
                'Tempeh (400g)',
                'Lentils (1kg)',
                'Chickpeas (3 cans)',
                'Nuts & seeds mix (500g)',
                'Nutritional yeast (200g)'
            ]
            del grocery_list['dairy']
            grocery_list['plant_milk'] = [
                'Almond milk (2L)',
                'Oat milk (1L)',
                'Coconut yogurt (500g)'
            ]
        
        if 'gluten-free' in dietary_restrictions:
            grocery_list['grains'] = [
                'Brown rice (1kg)',
                'Quinoa (500g)',
                'Gluten-free bread (2 loaves)',
                'Gluten-free oats (750g)',
                'Rice noodles (500g)'
            ]
        
        # Sustainability tips
        sustainability_tips = [
            '🌱 Choose organic produce when budget allows',
            '🌍 Buy local and seasonal fruits and vegetables',
            '♻️ Bring reusable bags and containers',
            '📋 Check expiry dates and buy only what you need',
            '💰 Compare prices and look for bulk discounts',
            '🚗 Plan your shopping to reduce trips and emissions',
            '🥫 Choose products with minimal packaging'
        ]
        
        # Estimate cost
        estimated_cost = f"${random.randint(55, 85)}-{random.randint(85, 120)} USD"
        
        return jsonify({
            'success': True,
            'grocery_list': {
                'categories': grocery_list,
                'estimated_cost': estimated_cost,
                'days': days
            },
            'sustainability_tips': sustainability_tips,
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== VOICE PROCESSING ROUTES =====

@app.route('/api/voice/process', methods=['POST'])
def process_voice():
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'en')
        
        # Process the voice command
        response = ai_bot.generate_response(text)
        
        # Add language-specific processing if needed
        language_responses = {
            'en': response,
            'es': f"Entiendo tu pregunta sobre nutrición. {response}",
            'fr': f"Je comprends votre question sur la nutrition. {response}",
            'am': f"የእርስዎን የተመጣጠነ ምግብ ጥያቄ ተረድቻለሁ። {response}"
        }
        
        processed_response = language_responses.get(language, response)
        
        return jsonify({
            'success': True,
            'response': processed_response,
            'detected_language': language,
            'original_text': text,
            'processed_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== DONATION ROUTES =====

@app.route('/api/donation/contribute', methods=['POST'])
def calculate_donation_impact():
    try:
        data = request.get_json()
        amount = data.get('amount', 0)
        currency = data.get('currency', 'USD')
        
        if amount <= 0:
            return jsonify({'success': False, 'message': 'Invalid donation amount'}), 400
        
        # Calculate impact (rough estimates)
        meals_provided = int(amount / 2.5)  # $2.5 per meal
        people_helped = max(1, int(meals_provided / 3))  # 3 meals per person per day
        
        impact_messages = [
            f"Your ${amount:.2f} donation can provide {meals_provided} nutritious meals!",
            f"You're helping feed {people_helped} people for a day!",
            f"Your generosity supports {meals_provided} meals for families in need!"
        ]
        
        selected_message = random.choice(impact_messages)
        
        return jsonify({
            'success': True,
            'impact_message': selected_message,
            'thank_you': 'Thank you for fighting hunger and supporting SDG 2! 🙏',
            'sdg_impact': 'Directly contributing to SDG 2: Zero Hunger',
            'breakdown': {
                'meals_provided': meals_provided,
                'people_helped': people_helped,
                'impact_duration': '1 day'
            },
            'next_steps': [
                'Share your impact on social media',
                'Encourage friends to join the cause',
                'Track your cumulative impact over time'
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== UTILITY FUNCTIONS =====

def check_meal_achievements(user_id):
    """Check and award meal-related achievements"""
    try:
        today = datetime.utcnow().date()
        meals_today = MealLog.query.filter(
            MealLog.user_id == user_id,
            db.func.date(MealLog.logged_at) == today
        ).count()
        
        # Check for daily meal achievement
        if meals_today >= 3:
            existing_achievement = UserAchievement.query.join(Achievement).filter(
                UserAchievement.user_id == user_id,
                Achievement.name == 'Daily Meal Master',
                db.func.date(UserAchievement.earned_at) == today
            ).first()
            
            if not existing_achievement:
                # Award achievement
                achievement = Achievement.query.filter_by(name='Daily Meal Master').first()
                if achievement:
                    user_achievement = UserAchievement(
                        user_id=user_id,
                        achievement_id=achievement.id
                    )
                    db.session.add(user_achievement)
                    db.session.commit()
                    
    except Exception as e:
        print(f"Achievement check error: {e}")

def init_sample_data():
    """Initialize sample achievements and data"""
    try:
        # Create sample achievements if they don't exist
        achievements = [
            {'name': 'Daily Meal Master', 'description': 'Log 3 meals in one day', 'badge_emoji': '🍽️', 'points': 50, 'category': 'meals'},
            {'name': 'Hydration Hero', 'description': 'Meet daily water goal', 'badge_emoji': '💧', 'points': 30, 'category': 'hydration'},
            {'name': 'Weekly Warrior', 'description': '7-day tracking streak', 'badge_emoji': '🔥', 'points': 100, 'category': 'consistency'},
            {'name': 'Protein Power', 'description': 'Meet protein goals for 5 days', 'badge_emoji': '🥩', 'points': 75, 'category': 'nutrition'},
            {'name': 'Veggie Champion', 'description': 'Eat 5+ servings of vegetables daily', 'badge_emoji': '🥬', 'points': 60, 'category': 'nutrition'}
        ]
        
        for ach_data in achievements:
            existing = Achievement.query.filter_by(name=ach_data['name']).first()
            if not existing:
                achievement = Achievement(**ach_data)
                db.session.add(achievement)
        
        db.session.commit()
        print("Sample data initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing sample data: {e}")

# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'success': False, 'message': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'success': False, 'message': 'Invalid token'}), 401

# ===== INITIALIZE DATABASE AND RUN APP =====

# Initialize database for production
with app.app_context():
    db.create_all()
    init_sample_data()

if __name__ == '__main__':
    print("🍎 SmartEats API Server Starting...")
    print("🌍 Fighting Hunger (SDG 2) & Promoting Health (SDG 3)")
    print("🚀 Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
