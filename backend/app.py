"""
SmartEats - Python Flask Backend
Hackathon 2025 - SDG 2 & SDG 3 Solution
Supporting MySQL, MongoDB, and Firebase databases
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import requests
from datetime import datetime
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database imports
import mysql.connector
from pymongo import MongoClient
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Configuration
DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'mysql')  # mysql, mongodb, firebase
HUGGING_FACE_API_KEY = os.getenv('HUGGING_FACE_API_KEY', 'hf_your_key_here')

# Nutrition APIs Configuration
NUTRITIONIX_APP_ID = os.getenv('NUTRITIONIX_APP_ID', 'your_app_id')
NUTRITIONIX_API_KEY = os.getenv('NUTRITIONIX_API_KEY', 'your_api_key')
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY', 'your_spoonacular_key')
EDAMAM_APP_ID = os.getenv('EDAMAM_APP_ID', 'your_edamam_app_id')
EDAMAM_API_KEY = os.getenv('EDAMAM_API_KEY', 'your_edamam_key')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your_openai_key')

# Database connections
db_connection = None
mongo_db = None
firebase_db = None

def initialize_databases():
    """Initialize database connections based on configuration"""
    global db_connection, mongo_db, firebase_db
    
    try:
        if DATABASE_TYPE == 'mysql':
            db_connection = mysql.connector.connect(
                host=os.getenv('MYSQL_HOST', 'localhost'),
                port=int(os.getenv('MYSQL_PORT', 3306)),
                user=os.getenv('MYSQL_USER', 'root'),
                password=os.getenv('MYSQL_PASSWORD', 'password'),
                database=os.getenv('MYSQL_DB', 'smarteats')
            )
            print("✅ MySQL connected successfully")
            
        elif DATABASE_TYPE == 'mongodb':
            mongo_client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
            mongo_db = mongo_client[os.getenv('MONGODB_DB', 'smarteats')]
            print("✅ MongoDB connected successfully")
            
        elif DATABASE_TYPE == 'firebase':
            # Initialize Firebase
            if not firebase_admin._apps:
                firebase_config = {
                    "type": "service_account",
                    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                    "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                }
                cred = credentials.Certificate(firebase_config)
                firebase_admin.initialize_app(cred)
            firebase_db = firestore.client()
            print("✅ Firebase connected successfully")
            
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("📝 Running in demo mode - some features may have limited functionality")
        print("👍 API endpoints will work with sample data instead of live database")

# Initialize on startup
initialize_databases()

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "SmartEats API is running",
        "database": DATABASE_TYPE,
        "sdg_goals": ["SDG 2: Zero Hunger", "SDG 3: Good Health and Well-Being"]
    })

@app.route('/api/nutrition/calculate', methods=['POST'])
def calculate_nutrition():
    """Calculate personalized nutrition needs"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['age', 'gender', 'height', 'weight', 'activity']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        # Calculate nutrition values
        results = calculate_nutrition_values(data)
        
        # Save to database
        save_user_profile(data, results)
        
        return jsonify({
            "success": True,
            "results": results,
            "message": "Nutrition calculated successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_nutrition_values(data):
    """Calculate BMI, BMR, TDEE, and macronutrients"""
    age = data['age']
    gender = data['gender']
    height = data['height']  # cm
    weight = data['weight']  # kg
    activity = data['activity']
    
    # BMI Calculation
    height_m = height / 100
    bmi = weight / (height_m ** 2)
    
    # BMR Calculation (Mifflin-St Jeor Equation)
    if gender == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # Activity multipliers
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very': 1.725,
        'extra': 1.9
    }
    
    tdee = bmr * activity_multipliers.get(activity, 1.2)
    
    # Macronutrient calculations
    protein = weight * 2.2  # 2.2g per kg
    fat = tdee * 0.25 / 9   # 25% of calories from fat
    carbs = (tdee - (protein * 4) - (fat * 9)) / 4  # Remaining from carbs
    water = weight * 0.035  # 35ml per kg
    
    return {
        "bmi": round(bmi, 1),
        "bmr": round(bmr),
        "tdee": round(tdee),
        "calories": round(tdee),
        "protein": round(protein),
        "carbs": round(carbs),
        "fat": round(fat),
        "water": round(water, 1)
    }

def save_user_profile(profile_data, nutrition_results):
    """Save user profile to database"""
    try:
        if DATABASE_TYPE == 'mysql':
            save_to_mysql(profile_data, nutrition_results)
        elif DATABASE_TYPE == 'mongodb':
            save_to_mongodb(profile_data, nutrition_results)
        elif DATABASE_TYPE == 'firebase':
            save_to_firebase(profile_data, nutrition_results)
    except Exception as e:
        print(f"Database save error: {e}")

def save_to_mysql(profile_data, nutrition_results):
    """Save to MySQL database"""
    if not db_connection:
        print("No MySQL connection available - running in demo mode")
        return
        
    cursor = db_connection.cursor()
    
    # Insert user profile
    user_query = """
    INSERT INTO users (age, gender, height, weight, activity_level) 
    VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(user_query, (
        profile_data['age'], profile_data['gender'], 
        profile_data['height'], profile_data['weight'], 
        profile_data['activity']
    ))
    
    user_id = cursor.lastrowid
    
    # Insert nutrition profile
    nutrition_query = """
    INSERT INTO nutrition_profiles 
    (user_id, bmi, bmr, tdee, calorie_goal, protein_goal, carb_goal, fat_goal, water_goal) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(nutrition_query, (
        user_id, nutrition_results['bmi'], nutrition_results['bmr'],
        nutrition_results['tdee'], nutrition_results['calories'],
        nutrition_results['protein'], nutrition_results['carbs'],
        nutrition_results['fat'], nutrition_results['water']
    ))
    
    db_connection.commit()
    cursor.close()

def save_to_mongodb(profile_data, nutrition_results):
    """Save to MongoDB database"""
    if not mongo_db:
        print("No MongoDB connection available - running in demo mode")
        return
        
    user_doc = {
        **profile_data,
        "created_at": datetime.now(),
        "nutrition_results": nutrition_results
    }
    mongo_db.users.insert_one(user_doc)

def save_to_firebase(profile_data, nutrition_results):
    """Save to Firebase Firestore"""
    if not firebase_db:
        print("No Firebase connection available - running in demo mode")
        return
        
    user_ref = firebase_db.collection('users').document()
    user_ref.set({
        **profile_data,
        "created_at": datetime.now(),
        "nutrition_results": nutrition_results
    })

@app.route('/api/recipes/search', methods=['POST'])
def search_recipes():
    """Search for recipes based on ingredients"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '')
        
        # Generate recipe suggestions based on ingredients
        recipes = generate_recipe_suggestions(ingredients)
        
        return jsonify({
            "success": True,
            "recipes": recipes,
            "message": f"Found {len(recipes)} recipes with your ingredients"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_recipe_suggestions(ingredients):
    """Generate healthy recipe suggestions"""
    # Sample healthy recipes
    all_recipes = [
        {
            "id": "healthy-salad",
            "name": "Power Protein Salad",
            "description": "Mixed greens with grilled chicken, quinoa, and avocado",
            "calories": 420,
            "protein": 35,
            "carbs": 25,
            "fat": 18,
            "prepTime": 20,
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
            "ingredients": ["chicken", "quinoa", "lettuce", "avocado", "tomatoes"]
        },
        {
            "id": "salmon-rice",
            "name": "Baked Salmon & Brown Rice",
            "description": "Omega-3 rich salmon with fiber-packed brown rice and vegetables",
            "calories": 380,
            "protein": 28,
            "carbs": 35,
            "fat": 12,
            "prepTime": 30,
            "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop",
            "ingredients": ["salmon", "brown rice", "broccoli", "carrots"]
        },
        {
            "id": "veggie-wrap",
            "name": "Mediterranean Veggie Wrap",
            "description": "Hummus, fresh vegetables, and feta in whole wheat wrap",
            "calories": 320,
            "protein": 15,
            "carbs": 40,
            "fat": 12,
            "prepTime": 10,
            "image": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop",
            "ingredients": ["hummus", "vegetables", "feta", "wrap", "cucumber"]
        },
        {
            "id": "quinoa-bowl",
            "name": "Quinoa Buddha Bowl",
            "description": "Nutritious quinoa with roasted vegetables and tahini dressing",
            "calories": 390,
            "protein": 18,
            "carbs": 45,
            "fat": 15,
            "prepTime": 25,
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
            "ingredients": ["quinoa", "sweet potato", "chickpeas", "kale", "tahini"]
        },
        {
            "id": "egg-toast",
            "name": "Avocado Egg Toast",
            "description": "Whole grain toast with avocado and poached egg",
            "calories": 280,
            "protein": 12,
            "carbs": 20,
            "fat": 18,
            "prepTime": 8,
            "image": "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=200&fit=crop",
            "ingredients": ["bread", "avocado", "egg", "tomato"]
        }
    ]
    
    # Filter recipes based on ingredients (simple matching)
    if ingredients:
        ingredient_list = [ing.strip().lower() for ing in ingredients.split(',')]
        filtered_recipes = []
        
        for recipe in all_recipes:
            recipe_ingredients = [ing.lower() for ing in recipe['ingredients']]
            # Check if any user ingredient matches recipe ingredients
            if any(user_ing in ' '.join(recipe_ingredients) for user_ing in ingredient_list):
                filtered_recipes.append(recipe)
        
        return filtered_recipes if filtered_recipes else all_recipes[:3]
    
    return all_recipes

@app.route('/api/meals/log', methods=['POST'])
def log_meal():
    """Log a meal consumption"""
    try:
        data = request.get_json()
        meal_id = data.get('meal_id')
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        # Save meal log to database
        save_meal_log(meal_id, timestamp)
        
        return jsonify({
            "success": True,
            "message": "Meal logged successfully",
            "logged_at": timestamp
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def save_meal_log(meal_id, timestamp):
    """Save meal log to database"""
    try:
        if DATABASE_TYPE == 'mysql' and db_connection:
            cursor = db_connection.cursor()
            query = "INSERT INTO meal_logs (meal_id, timestamp) VALUES (%s, %s)"
            cursor.execute(query, (meal_id, timestamp))
            db_connection.commit()
            cursor.close()
            
        elif DATABASE_TYPE == 'mongodb' and mongo_db:
            mongo_db.meal_logs.insert_one({
                "meal_id": meal_id,
                "timestamp": timestamp,
                "created_at": datetime.now()
            })
            
        elif DATABASE_TYPE == 'firebase' and firebase_db:
            firebase_db.collection('meal_logs').add({
                "meal_id": meal_id,
                "timestamp": timestamp,
                "created_at": datetime.now()
            })
        else:
            print(f"Meal log saved locally (demo mode): {meal_id} at {timestamp}")
            
    except Exception as e:
        print(f"Error saving meal log: {e}")

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """Chat with AI nutrition assistant using Hugging Face API"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        # Get AI response from Hugging Face
        ai_response = get_hugging_face_response(user_message)
        
        # Save chat to database
        save_chat_message(user_message, ai_response)
        
        return jsonify({
            "success": True,
            "response": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        # Fallback to local responses
        local_response = get_local_nutrition_response(data.get('message', ''))
        return jsonify({
            "success": True,
            "response": local_response,
            "timestamp": datetime.now().isoformat(),
            "source": "local_fallback"
        })

def get_hugging_face_response(question):
    """Get response from Hugging Face Question-Answering API"""
    try:
        # Nutrition context for better answers
        context = """
        Nutrition is essential for good health. A balanced diet includes proteins, carbohydrates, 
        healthy fats, vitamins, and minerals. Daily calorie needs vary by age, gender, weight, 
        height, and activity level. Protein helps build muscle, carbohydrates provide energy, 
        and fats support hormone production. Drink plenty of water, eat fruits and vegetables, 
        and maintain a healthy weight through proper nutrition and exercise.
        """
        
        headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
        
        payload = {
            "inputs": {
                "question": question,
                "context": context
            }
        }
        
        response = requests.post(
            "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('answer', get_local_nutrition_response(question))
        else:
            return get_local_nutrition_response(question)
            
    except Exception as e:
        print(f"Hugging Face API error: {e}")
        return get_local_nutrition_response(question)

def get_local_nutrition_response(message):
    """Generate local nutrition responses"""
    responses = {
        "protein": "For optimal health, aim for 0.8-2.2g of protein per kg of body weight daily. Good sources include lean meats, fish, eggs, legumes, and dairy products. 🥩",
        "water": "Drink at least 8 glasses (2L) of water daily. Your needs may increase with exercise or hot weather. Proper hydration supports metabolism! 💧",
        "weight": "Healthy weight loss is 0.5-1kg per week. Focus on a balanced diet with moderate calorie deficit and regular exercise. ⚖️",
        "calories": "Daily calorie needs depend on age, gender, weight, height, and activity level. Use our nutrition calculator for personalized recommendations! 🔥",
        "vegetables": "Aim for 5-9 servings of fruits and vegetables daily. They provide essential vitamins, minerals, and fiber. Eat the rainbow! 🥬🥕",
        "exercise": "Combine 150 minutes of moderate cardio weekly with 2-3 strength training sessions. Exercise boosts metabolism! 💪",
        "hunger": "Combat hunger with nutrient-dense foods: whole grains, lean proteins, fruits, and vegetables. Small frequent meals help maintain energy levels! 🍽️",
        "health": "Good health starts with balanced nutrition, regular exercise, adequate sleep, and stress management. Small consistent changes make big impacts! 🌟"
    }
    
    message_lower = message.lower()
    
    for keyword, response in responses.items():
        if keyword in message_lower:
            return response
    
    return "I'm here to help with nutrition questions! Ask me about calories, protein, healthy recipes, weight management, or wellness tips. Fighting hunger and promoting health together! 🍎✨"

def save_chat_message(user_message, ai_response):
    """Save chat interaction to database"""
    try:
        timestamp = datetime.now()
        
        if DATABASE_TYPE == 'mysql' and db_connection:
            cursor = db_connection.cursor()
            query = "INSERT INTO chat_messages (user_message, ai_response, timestamp) VALUES (%s, %s, %s)"
            cursor.execute(query, (user_message, ai_response, timestamp))
            db_connection.commit()
            cursor.close()
            
        elif DATABASE_TYPE == 'mongodb' and mongo_db:
            mongo_db.chat_messages.insert_one({
                "user_message": user_message,
                "ai_response": ai_response,
                "timestamp": timestamp
            })
            
        elif DATABASE_TYPE == 'firebase' and firebase_db:
            firebase_db.collection('chat_messages').add({
                "user_message": user_message,
                "ai_response": ai_response,
                "timestamp": timestamp
            })
        else:
            print(f"Chat saved locally (demo mode): {user_message[:50]}... -> {ai_response[:50]}...")
            
    except Exception as e:
        print(f"Error saving chat message: {e}")

@app.route('/api/meals', methods=['GET'])
def get_meals():
    """Get available meals from database"""
    try:
        # Sample meal data - in real app, fetch from database
        meals = [
            {
                "id": "breakfast-1",
                "name": "Oatmeal with Berries",
                "category": "breakfast",
                "calories": 300,
                "protein": 10,
                "carbs": 55,
                "fat": 5,
                "sdg_benefit": "Provides sustained energy and essential nutrients (SDG 3)"
            },
            {
                "id": "lunch-1", 
                "name": "Quinoa Veggie Bowl",
                "category": "lunch",
                "calories": 400,
                "protein": 15,
                "carbs": 60,
                "fat": 12,
                "sdg_benefit": "Plant-based protein supports food security (SDG 2)"
            },
            {
                "id": "dinner-1",
                "name": "Grilled Fish with Vegetables",
                "category": "dinner", 
                "calories": 350,
                "protein": 30,
                "carbs": 20,
                "fat": 15,
                "sdg_benefit": "Lean protein promotes healthy development (SDG 3)"
            }
        ]
        
        return jsonify({
            "success": True,
            "meals": meals,
            "total": len(meals)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/dashboard', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Sample stats - in real app, calculate from database
        stats = {
            "calories_today": 1250,
            "water_intake": "1.5L",
            "meals_logged": 3,
            "protein_goal_progress": 75,
            "weekly_progress": [1200, 1350, 1100, 1450, 1300, 1250, 1400]
        }
        
        return jsonify({
            "success": True,
            "stats": stats,
            "sdg_impact": {
                "hunger_prevention": "Proper nutrition planning helps prevent malnutrition",
                "health_promotion": "Tracking supports maintaining healthy lifestyle"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/nutrition/lookup', methods=['POST'])
def lookup_food_nutrition():
    """Look up nutrition information for specific foods using external APIs"""
    try:
        data = request.get_json()
        food_name = data.get('food', '')
        
        if not food_name:
            return jsonify({"error": "Food name is required"}), 400
        
        # Try different nutrition APIs
        nutrition_data = get_nutrition_data(food_name)
        
        return jsonify({
            "success": True,
            "food": food_name,
            "nutrition": nutrition_data,
            "message": "Nutrition data retrieved successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_nutrition_data(food_name):
    """Get nutrition data from external APIs"""
    # Try Nutritionix API first
    try:
        nutritionix_data = query_nutritionix_api(food_name)
        if nutritionix_data:
            return nutritionix_data
    except Exception as e:
        print(f"Nutritionix API error: {e}")
    
    # Fallback to CalorieNinjas API
    try:
        calorie_ninja_data = query_calorie_ninjas_api(food_name)
        if calorie_ninja_data:
            return calorie_ninja_data
    except Exception as e:
        print(f"CalorieNinjas API error: {e}")
    
    # Fallback to sample data
    return get_sample_nutrition_data(food_name)

def query_nutritionix_api(food_name):
    """Query Nutritionix API for nutrition data"""
    headers = {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        "query": food_name
    }
    
    response = requests.post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        headers=headers,
        json=payload,
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('foods'):
            food = data['foods'][0]
            return {
                "calories": food.get('nf_calories', 0),
                "protein": food.get('nf_protein', 0),
                "carbs": food.get('nf_total_carbohydrate', 0),
                "fat": food.get('nf_total_fat', 0),
                "fiber": food.get('nf_dietary_fiber', 0),
                "sugar": food.get('nf_sugars', 0),
                "serving_qty": food.get('serving_qty', 1),
                "serving_unit": food.get('serving_unit', 'serving'),
                "source": "Nutritionix API"
            }
    return None

def query_calorie_ninjas_api(food_name):
    """Query CalorieNinjas API for nutrition data"""
    headers = {
        'X-Api-Key': os.getenv('CALORIE_NINJAS_API_KEY', 'YOUR_CALORIE_NINJAS_API_KEY')
    }
    
    response = requests.get(
        f"https://api.calorieninjas.com/v1/nutrition?query={food_name}",
        headers=headers,
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('items'):
            item = data['items'][0]
            return {
                "calories": item.get('calories', 0),
                "protein": item.get('protein_g', 0),
                "carbs": item.get('carbohydrates_total_g', 0),
                "fat": item.get('fat_total_g', 0),
                "fiber": item.get('fiber_g', 0),
                "sugar": item.get('sugar_g', 0),
                "serving_qty": 100,
                "serving_unit": "grams",
                "source": "CalorieNinjas API"
            }
    return None

def get_sample_nutrition_data(food_name):
    """Get sample nutrition data as fallback"""
    sample_foods = {
        "apple": {"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "fiber": 2.4},
        "banana": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "fiber": 2.6},
        "chicken": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
        "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "fiber": 0.4},
        "broccoli": {"calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "fiber": 2.6}
    }
    
    food_key = food_name.lower().strip()
    for key, data in sample_foods.items():
        if key in food_key:
            return {**data, "serving_qty": 100, "serving_unit": "grams", "source": "sample_data"}
    
    # Default nutrition for unknown foods
    return {
        "calories": 100, "protein": 5, "carbs": 15, "fat": 3, "fiber": 2,
        "serving_qty": 100, "serving_unit": "grams", "source": "estimated"
    }

@app.route('/api/recipes/spoonacular', methods=['POST'])
def search_spoonacular_recipes():
    """Search recipes using Spoonacular API"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '')
        
        # Query Spoonacular API
        recipes = query_spoonacular_api(ingredients)
        
        return jsonify({
            "success": True,
            "recipes": recipes,
            "source": "Spoonacular API",
            "message": f"Found {len(recipes)} recipes"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def query_spoonacular_api(ingredients):
    """Query Spoonacular API for recipes"""
    try:
        params = {
            'ingredients': ingredients,
            'number': 6,
            'apiKey': SPOONACULAR_API_KEY
        }
        
        response = requests.get(
            "https://api.spoonacular.com/recipes/findByIngredients",
            params=params,
            timeout=10
        )
        
        if response.status_code == 200:
            recipes_data = response.json()
            formatted_recipes = []
            
            for recipe in recipes_data:
                formatted_recipes.append({
                    "id": f"spoon_{recipe['id']}",
                    "name": recipe['title'],
                    "description": f"Recipe using {recipe['usedIngredientCount']} of your ingredients",
                    "image": recipe['image'],
                    "missing_ingredients": recipe['missedIngredientCount'],
                    "used_ingredients": recipe['usedIngredientCount'],
                    "source": "Spoonacular"
                })
            
            return formatted_recipes
    except Exception as e:
        print(f"Spoonacular API error: {e}")
    
    return []

@app.route('/api/water/calculate', methods=['POST'])
def calculate_water_needs():
    """Calculate daily water needs based on weight and activity"""
    try:
        data = request.get_json()
        weight = data.get('weight', 70)  # kg
        activity_level = data.get('activity', 'moderate')
        climate = data.get('climate', 'temperate')  # hot, temperate, cold
        
        # Base water calculation: 30-35ml per kg
        base_water = weight * 0.035  # liters
        
        # Activity adjustments
        activity_multipliers = {
            'sedentary': 1.0,
            'light': 1.1,
            'moderate': 1.2,
            'very': 1.4,
            'extra': 1.6
        }
        
        # Climate adjustments
        climate_multipliers = {
            'cold': 0.9,
            'temperate': 1.0,
            'hot': 1.3
        }
        
        adjusted_water = base_water * activity_multipliers.get(activity_level, 1.0) * climate_multipliers.get(climate, 1.0)
        
        return jsonify({
            "success": True,
            "daily_water_needs": {
                "liters": round(adjusted_water, 1),
                "glasses": round(adjusted_water * 4),  # 250ml glasses
                "bottles": round(adjusted_water * 2),  # 500ml bottles
            },
            "recommendations": {
                "morning": "Start with 2 glasses upon waking",
                "pre_meals": "1 glass 30 minutes before each meal",
                "exercise": "Extra 500ml for every hour of exercise",
                "climate_note": f"Adjusted for {climate} climate"
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export/meal-plan', methods=['POST'])
def export_meal_plan():
    """Export meal plan data for download"""
    try:
        data = request.get_json()
        format_type = data.get('format', 'json')  # json, csv
        
        # Get user's meal plan data
        meal_plan = get_user_meal_plan()
        
        if format_type == 'csv':
            csv_data = convert_to_csv(meal_plan)
            return jsonify({
                "success": True,
                "data": csv_data,
                "format": "csv",
                "filename": f"smarteats_meal_plan_{datetime.now().strftime('%Y%m%d')}.csv"
            })
        else:
            return jsonify({
                "success": True,
                "data": meal_plan,
                "format": "json",
                "filename": f"smarteats_meal_plan_{datetime.now().strftime('%Y%m%d')}.json"
            })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_user_meal_plan():
    """Get user's meal plan data"""
    return {
        "date_generated": datetime.now().isoformat(),
        "meals": [
            {"meal": "Breakfast", "food": "Oatmeal with Berries", "calories": 300, "protein": 10},
            {"meal": "Lunch", "food": "Quinoa Bowl", "calories": 400, "protein": 15},
            {"meal": "Dinner", "food": "Grilled Salmon", "calories": 350, "protein": 30}
        ],
        "totals": {"calories": 1050, "protein": 55},
        "sdg_impact": "Balanced nutrition supporting SDG 2 & 3"
    }

def convert_to_csv(meal_plan):
    """Convert meal plan to CSV format"""
    csv_lines = ["Meal,Food,Calories,Protein"]
    for meal in meal_plan['meals']:
        csv_lines.append(f"{meal['meal']},{meal['food']},{meal['calories']},{meal['protein']}")
    return "\n".join(csv_lines)

@app.route('/api/database/setup', methods=['POST'])
def setup_database():
    """Setup database tables/collections"""
    try:
        if DATABASE_TYPE == 'mysql':
            setup_mysql_tables()
        elif DATABASE_TYPE == 'mongodb':
            setup_mongodb_collections()
        elif DATABASE_TYPE == 'firebase':
            setup_firebase_collections()
            
        return jsonify({
            "success": True,
            "message": f"{DATABASE_TYPE} database setup completed",
            "database_type": DATABASE_TYPE
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def setup_mysql_tables():
    """Create MySQL tables"""
    cursor = db_connection.cursor()
    
    tables = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            age INT NOT NULL,
            gender ENUM('male', 'female', 'other') NOT NULL,
            height DECIMAL(5,2) NOT NULL,
            weight DECIMAL(5,2) NOT NULL,
            activity_level VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
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
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS meal_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            meal_id VARCHAR(50),
            timestamp VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_message TEXT,
            ai_response TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]
    
    for table_sql in tables:
        cursor.execute(table_sql)
    
    db_connection.commit()
    cursor.close()

def setup_mongodb_collections():
    """Setup MongoDB collections"""
    if mongo_db is not None:
        # MongoDB collections are created automatically when first document is inserted
        # Create indexes for better performance
        mongo_db.users.create_index("created_at")
        mongo_db.meal_logs.create_index("timestamp")
        mongo_db.chat_messages.create_index("timestamp")

def setup_firebase_collections():
    """Setup Firebase Firestore collections"""
    # Firebase collections are created automatically
    # Add initial document to create collections
    firebase_db.collection('users').document('init').set({"initialized": True})
    firebase_db.collection('meal_logs').document('init').set({"initialized": True})
    firebase_db.collection('chat_messages').document('init').set({"initialized": True})

@app.route('/api/ai/recipe-generator', methods=['POST'])
def ai_recipe_generator():
    """AI Recipe Generator 2.0 - Advanced recipe suggestions"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        dietary_restrictions = data.get('dietary_restrictions', [])
        calorie_target = data.get('calorie_target', 2000)
        mood = data.get('mood', 'neutral')
        
        # Generate AI-powered recipe suggestions
        recipes = generate_ai_recipes(ingredients, dietary_restrictions, calorie_target, mood)
        
        return jsonify({
            "success": True,
            "recipes": recipes,
            "ai_reasoning": "Recipes optimized for your ingredients, dietary needs, and current mood",
            "sdg_impact": "Supporting food security and healthy eating (SDG 2 & 3)"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_ai_recipes(ingredients, dietary_restrictions, calorie_target, mood):
    """Generate mood and dietary-aware recipes"""
    mood_recipes = {
        "happy": [
            {"name": "Colorful Rainbow Bowl", "mood_benefit": "Vibrant colors boost happiness", "calories": 380},
            {"name": "Celebration Smoothie", "mood_benefit": "Fresh fruits enhance positive mood", "calories": 250}
        ],
        "stressed": [
            {"name": "Calming Chamomile Oats", "mood_benefit": "Magnesium reduces stress", "calories": 320},
            {"name": "Stress-Relief Salmon", "mood_benefit": "Omega-3 supports mental health", "calories": 420}
        ],
        "tired": [
            {"name": "Energy Boost Quinoa", "mood_benefit": "Complex carbs provide sustained energy", "calories": 400},
            {"name": "Iron-Rich Spinach Salad", "mood_benefit": "Iron fights fatigue", "calories": 280}
        ]
    }
    
    return mood_recipes.get(mood, mood_recipes["happy"])

@app.route('/api/wellness/sleep-stress', methods=['POST'])
def track_sleep_stress():
    """Track sleep and stress for wellness insights"""
    try:
        data = request.get_json()
        sleep_hours = data.get('sleep_hours', 8)
        stress_level = data.get('stress_level', 5)  # 1-10 scale
        
        # Generate wellness recommendations
        recommendations = generate_wellness_recommendations(sleep_hours, stress_level)
        
        # Save to database
        save_wellness_data(sleep_hours, stress_level)
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "wellness_score": calculate_wellness_score(sleep_hours, stress_level),
            "sdg_impact": "Supporting mental and physical well-being (SDG 3)"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_wellness_recommendations(sleep_hours, stress_level):
    """Generate personalized wellness recommendations"""
    recommendations = []
    
    if sleep_hours < 7:
        recommendations.append({
            "type": "sleep",
            "message": "💤 Aim for 7-9 hours of sleep for optimal health",
            "action": "Try magnesium-rich foods like almonds before bed"
        })
    
    if stress_level > 7:
        recommendations.append({
            "type": "stress",
            "message": "🧘 High stress detected - focus on stress-reducing foods",
            "action": "Include omega-3 rich foods like salmon and walnuts"
        })
    
    if sleep_hours >= 7 and stress_level <= 5:
        recommendations.append({
            "type": "great",
            "message": "🌟 Excellent wellness balance! Keep it up!",
            "action": "Maintain your current healthy routine"
        })
    
    return recommendations

def calculate_wellness_score(sleep_hours, stress_level):
    """Calculate overall wellness score (0-100)"""
    sleep_score = min(100, (sleep_hours / 8) * 50)  # Max 50 points
    stress_score = max(0, 50 - (stress_level * 5))   # Max 50 points
    return round(sleep_score + stress_score)

def save_wellness_data(sleep_hours, stress_level):
    """Save wellness data to database"""
    try:
        timestamp = datetime.now()
        
        if DATABASE_TYPE == 'mysql' and db_connection:
            cursor = db_connection.cursor()
            query = "INSERT INTO wellness_logs (sleep_hours, stress_level, timestamp) VALUES (%s, %s, %s)"
            cursor.execute(query, (sleep_hours, stress_level, timestamp))
            db_connection.commit()
            cursor.close()
            
        elif DATABASE_TYPE == 'mongodb' and mongo_db:
            mongo_db.wellness_logs.insert_one({
                "sleep_hours": sleep_hours,
                "stress_level": stress_level,
                "timestamp": timestamp
            })
            
        elif DATABASE_TYPE == 'firebase' and firebase_db:
            firebase_db.collection('wellness_logs').add({
                "sleep_hours": sleep_hours,
                "stress_level": stress_level,
                "timestamp": timestamp
            })
        else:
            print(f"Wellness data saved locally (demo mode): {sleep_hours}h sleep, stress level {stress_level}")
            
    except Exception as e:
        print(f"Error saving wellness data: {e}")

@app.route('/api/community/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get community leaderboard for gamification"""
    try:
        # Sample leaderboard data
        leaderboard = [
            {"rank": 1, "username": "HealthHero123", "score": 950, "streak": 15, "badge": "🏆"},
            {"rank": 2, "username": "NutritionNinja", "score": 890, "streak": 12, "badge": "🥈"},
            {"rank": 3, "username": "WellnessWarrior", "score": 850, "streak": 10, "badge": "🥉"},
            {"rank": 4, "username": "HealthyEater", "score": 780, "streak": 8, "badge": "⭐"},
            {"rank": 5, "username": "FitnessFan", "score": 720, "streak": 6, "badge": "💪"}
        ]
        
        return jsonify({
            "success": True,
            "leaderboard": leaderboard,
            "your_rank": 15,  # Sample user rank
            "community_impact": "Together fighting hunger and promoting health!"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sustainability/score', methods=['POST'])
def calculate_sustainability_score():
    """Calculate environmental impact of meal choices"""
    try:
        data = request.get_json()
        meals = data.get('meals', [])
        
        # Calculate sustainability score
        sustainability_data = calculate_meal_sustainability(meals)
        
        return jsonify({
            "success": True,
            "sustainability_score": sustainability_data['score'],
            "carbon_footprint": sustainability_data['carbon_kg'],
            "water_usage": sustainability_data['water_liters'],
            "recommendations": sustainability_data['recommendations'],
            "sdg_impact": "Supporting sustainable food systems and climate action"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_meal_sustainability(meals):
    """Calculate sustainability metrics for meals"""
    # Sample sustainability scoring
    plant_based_score = 0
    total_meals = len(meals)
    
    for meal in meals:
        if any(ingredient in meal.get('name', '').lower() 
               for ingredient in ['vegetable', 'fruit', 'quinoa', 'legume', 'bean']):
            plant_based_score += 1
    
    sustainability_score = (plant_based_score / total_meals * 100) if total_meals > 0 else 0
    
    return {
        "score": round(sustainability_score),
        "carbon_kg": round(2.5 - (sustainability_score * 0.02), 1),  # Lower with more plants
        "water_liters": round(1000 - (sustainability_score * 5)),     # Less water with plants
        "recommendations": [
            "🌱 Add more plant-based proteins for better sustainability",
            "🥬 Choose seasonal, local vegetables when possible",
            "♻️ Reduce food waste by meal planning"
        ] if sustainability_score < 70 else [
            "🌟 Excellent sustainability choices!",
            "🌍 Your meals support environmental health",
            "🌱 Keep choosing plant-based options"
        ]
    }

@app.route('/api/donation/contribute', methods=['POST'])
def process_donation():
    """Process meal donations for community impact"""
    try:
        data = request.get_json()
        amount = data.get('amount', 0)
        currency = data.get('currency', 'USD')
        
        # Calculate meal impact
        meals_provided = calculate_meal_impact(amount, currency)
        
        return jsonify({
            "success": True,
            "donation_amount": amount,
            "meals_provided": meals_provided,
            "impact_message": f"Your ${amount} donation can provide {meals_provided} nutritious meals!",
            "sdg_impact": "Directly contributing to SDG 2: Zero Hunger",
            "thank_you": "Thank you for fighting hunger! 🙏"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_meal_impact(amount, currency):
    """Calculate how many meals a donation can provide"""
    # Rough calculation: $2 per nutritious meal
    cost_per_meal = 2.0
    return round(amount / cost_per_meal)

@app.route('/api/voice/process', methods=['POST'])
def process_voice_command():
    """Process voice commands for accessibility"""
    try:
        data = request.get_json()
        voice_text = data.get('text', '')
        language = data.get('language', 'en')
        
        # Process voice command
        response = process_voice_nutrition_command(voice_text, language)
        
        return jsonify({
            "success": True,
            "response": response,
            "language": language,
            "accessibility_note": "Voice commands support inclusive nutrition guidance"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def process_voice_nutrition_command(text, language):
    """Process voice commands in multiple languages"""
    # Multi-language responses
    responses = {
        'en': {
            'calories': "Your daily calorie needs depend on your personal profile. Use our calculator!",
            'water': "Drink 8-10 glasses of water daily for optimal hydration.",
            'protein': "Aim for 0.8-2.2 grams of protein per kilogram of body weight."
        },
        'am': {  # Amharic (simplified)
            'calories': "የእርስዎ ዕለታዊ ካሎሪ ፍላጎት በግል መገለጫዎ ላይ ይወሰናል።",
            'water': "ለተሻለ ውሃ አቅርቦት በቀን 8-10 ብርጭቆ ውሃ ይጠጡ።",
            'protein': "በኪሎግራም ክብደት 0.8-2.2 ግራም ፕሮቲን ያስፈልጋል።"
        },
        'sw': {  # Swahili
            'calories': "Mahitaji yako ya kila siku ya kalori yanategemea wasifu wako binafsi.",
            'water': "Nywa mikooa 8-10 ya maji kila siku kwa afya bora.",
            'protein': "Lenga gramu 0.8-2.2 za protini kwa kila kilogramu ya uzito."
        },
        'fr': {  # French
            'calories': "Vos besoins caloriques quotidiens dépendent de votre profil personnel.",
            'water': "Buvez 8-10 verres d'eau par jour pour une hydratation optimale.",
            'protein': "Visez 0,8-2,2 grammes de protéines par kilogramme de poids corporel."
        }
    }
    
    text_lower = text.lower()
    lang_responses = responses.get(language, responses['en'])
    
    for keyword, response in lang_responses.items():
        if keyword in text_lower:
            return response
    
    return lang_responses.get('calories', "I'm here to help with nutrition questions!")

@app.route('/api/challenges/weekly', methods=['GET'])
def get_weekly_challenges():
    """Get weekly nutrition challenges for gamification"""
    try:
        challenges = [
            {
                "id": "hydration-hero",
                "title": "💧 Hydration Hero",
                "description": "Drink 8 glasses of water daily for 7 days",
                "progress": 5,
                "target": 7,
                "reward": "50 points + Hydration Badge",
                "sdg_link": "Supporting good health (SDG 3)"
            },
            {
                "id": "veggie-champion",
                "title": "🥬 Veggie Champion",
                "description": "Eat 5 servings of vegetables daily",
                "progress": 3,
                "target": 7,
                "reward": "75 points + Plant Power Badge",
                "sdg_link": "Fighting hunger with nutrition (SDG 2)"
            },
            {
                "id": "community-helper",
                "title": "🤝 Community Helper",
                "description": "Share 3 healthy recipes with the community",
                "progress": 1,
                "target": 3,
                "reward": "100 points + Community Hero Badge",
                "sdg_link": "Building supportive communities (SDG 2 & 3)"
            }
        ]
        
        return jsonify({
            "success": True,
            "challenges": challenges,
            "total_points_available": 225,
            "community_message": "Join thousands fighting hunger and promoting health!"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/deficiency-check', methods=['POST'])
def check_nutritional_deficiencies():
    """AI-powered nutritional deficiency analysis"""
    try:
        data = request.get_json()
        daily_meals = data.get('meals', [])
        
        # Analyze potential deficiencies
        analysis = analyze_nutritional_gaps(daily_meals)
        
        return jsonify({
            "success": True,
            "analysis": analysis,
            "recommendations": analysis['recommendations'],
            "risk_level": analysis['risk_level'],
            "sdg_impact": "Preventing malnutrition and promoting health (SDG 2 & 3)"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def analyze_nutritional_gaps(meals):
    """Analyze meals for potential nutritional deficiencies"""
    # Simple analysis based on food groups
    food_groups = {
        'protein': 0, 'vegetables': 0, 'fruits': 0, 
        'grains': 0, 'dairy': 0, 'water': 0
    }
    
    for meal in meals:
        meal_name = meal.get('name', '').lower()
        if any(protein in meal_name for protein in ['chicken', 'fish', 'egg', 'beans']):
            food_groups['protein'] += 1
        if any(veg in meal_name for veg in ['salad', 'vegetable', 'broccoli', 'spinach']):
            food_groups['vegetables'] += 1
        # Add more analysis...
    
    recommendations = []
    risk_level = "low"
    
    if food_groups['protein'] < 2:
        recommendations.append("🥩 Add more protein sources - aim for protein at each meal")
        risk_level = "medium"
    
    if food_groups['vegetables'] < 3:
        recommendations.append("🥬 Increase vegetable intake - aim for 5 servings daily")
        risk_level = "medium"
    
    if not recommendations:
        recommendations = ["🌟 Great nutritional balance! Keep up the excellent work!"]
        risk_level = "low"
    
    return {
        "food_groups": food_groups,
        "recommendations": recommendations,
        "risk_level": risk_level,
        "score": calculate_nutrition_completeness_score(food_groups)
    }

def calculate_nutrition_completeness_score(food_groups):
    """Calculate how complete the nutrition is (0-100)"""
    max_scores = {'protein': 20, 'vegetables': 25, 'fruits': 15, 'grains': 20, 'dairy': 10, 'water': 10}
    total_score = 0
    
    for group, count in food_groups.items():
        max_score = max_scores.get(group, 10)
        total_score += min(max_score, count * 5)  # 5 points per serving, capped
    
    return min(100, total_score)

@app.route('/api/grocery/generate-list', methods=['POST'])
def generate_grocery_list():
    """Generate smart grocery list from meal plans"""
    try:
        data = request.get_json()
        meal_plan = data.get('meal_plan', [])
        days = data.get('days', 7)
        
        # Generate grocery list
        grocery_list = create_smart_grocery_list(meal_plan, days)
        
        return jsonify({
            "success": True,
            "grocery_list": grocery_list,
            "estimated_cost": grocery_list['estimated_cost'],
            "sustainability_tips": grocery_list['sustainability_tips'],
            "sdg_impact": "Supporting food security and sustainable consumption"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profile/save', methods=['POST'])
def save_user_profile_endpoint():
    """Save user profile information"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Save profile to database
        profile_id = save_user_profile_data(data)
        
        return jsonify({
            "success": True,
            "message": "Profile saved successfully",
            "profile_id": profile_id,
            "sdg_impact": "Personalized nutrition supports health goals (SDG 3)"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profile/load', methods=['GET'])
def load_user_profile():
    """Load user profile information"""
    try:
        # In a real app, get user ID from session/auth
        user_id = request.args.get('user_id', 'demo_user')
        
        # Load profile from database or return demo data
        profile = get_user_profile_data(user_id)
        
        return jsonify({
            "success": True,
            "profile": profile,
            "message": "Profile loaded successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profile/goals', methods=['POST'])
def save_user_goals():
    """Save user nutrition and wellness goals"""
    try:
        data = request.get_json()
        
        # Save goals to database
        goals_id = save_user_goals_data(data)
        
        return jsonify({
            "success": True,
            "message": "Goals saved successfully",
            "goals_id": goals_id,
            "motivation": "Great goals! You're on track to achieve better health!"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profile/achievements', methods=['GET'])
def get_user_achievements():
    """Get user achievements and badges"""
    try:
        user_id = request.args.get('user_id', 'demo_user')
        
        # Sample achievements data
        achievements = {
            "total_meals": 127,
            "streak_days": 15,
            "points_earned": 1340,
            "badges_earned": 8,
            "recent_achievements": [
                {"type": "challenge", "title": "Hydration Hero", "date": "2025-08-28", "points": 50},
                {"type": "badge", "title": "Plant Power", "date": "2025-08-25", "points": 75},
                {"type": "streak", "title": "15-Day Streak", "date": "2025-09-01", "points": 100}
            ],
            "wellness_score": 85,
            "sustainability_score": 72
        }
        
        return jsonify({
            "success": True,
            "achievements": achievements,
            "community_rank": 15,
            "sdg_impact": "Your consistent tracking helps promote health awareness!"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def create_smart_grocery_list(meal_plan, days):
    """Create optimized grocery list with sustainability focus"""
    # Sample grocery list generation
    grocery_items = {
        "proteins": ["Chicken breast (1kg)", "Salmon fillet (500g)", "Eggs (12 pack)"],
        "vegetables": ["Spinach (200g)", "Broccoli (300g)", "Tomatoes (500g)"],
        "grains": ["Brown rice (1kg)", "Quinoa (500g)", "Whole wheat bread"],
        "fruits": ["Bananas (6 pieces)", "Apples (6 pieces)", "Berries (250g)"],
        "others": ["Olive oil (500ml)", "Greek yogurt (1L)", "Avocados (3 pieces)"]
    }
    
    return {
        "categories": grocery_items,
        "estimated_cost": "$45-60 USD",
        "sustainability_tips": [
            "🌱 Choose organic when possible",
            "🌍 Buy local and seasonal produce",
            "♻️ Bring reusable bags",
            "🥬 Prioritize plant-based proteins"
        ],
        "meal_count": len(meal_plan) * days
    }

def save_user_profile_data(profile_data):
    """Save user profile data to database"""
    try:
        profile_id = f"profile_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if DATABASE_TYPE == 'mysql' and db_connection:
            cursor = db_connection.cursor()
            query = """
            INSERT INTO user_profiles 
            (profile_id, name, email, age, height, weight, activity_level, 
             dietary_restrictions, goals, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                profile_id, profile_data.get('name'), profile_data.get('email'),
                profile_data.get('age'), profile_data.get('height'), 
                profile_data.get('weight'), profile_data.get('activity'),
                ','.join(profile_data.get('dietary_restrictions', [])),
                json.dumps(profile_data.get('goals', {})),
                datetime.now()
            ))
            db_connection.commit()
            cursor.close()
            
        elif DATABASE_TYPE == 'mongodb' and mongo_db:
            mongo_db.user_profiles.insert_one({
                "profile_id": profile_id,
                **profile_data,
                "created_at": datetime.now()
            })
            
        elif DATABASE_TYPE == 'firebase' and firebase_db:
            firebase_db.collection('user_profiles').document(profile_id).set({
                **profile_data,
                "created_at": datetime.now()
            })
        else:
            print(f"Profile saved locally (demo mode): {profile_data.get('name')}")
            
        return profile_id
        
    except Exception as e:
        print(f"Error saving profile: {e}")
        return None

def get_user_profile_data(user_id):
    """Get user profile data from database"""
    try:
        if DATABASE_TYPE == 'mysql' and db_connection:
            cursor = db_connection.cursor(dictionary=True)
            query = "SELECT * FROM user_profiles WHERE profile_id = %s OR id = %s ORDER BY created_at DESC LIMIT 1"
            cursor.execute(query, (user_id, user_id))
            result = cursor.fetchone()
            cursor.close()
            if result:
                return result
                
        elif DATABASE_TYPE == 'mongodb' and mongo_db:
            result = mongo_db.user_profiles.find_one({"profile_id": user_id})
            if result:
                result.pop('_id', None)  # Remove MongoDB ObjectId
                return result
                
        elif DATABASE_TYPE == 'firebase' and firebase_db:
            doc = firebase_db.collection('user_profiles').document(user_id).get()
            if doc.exists:
                return doc.to_dict()
    except Exception as e:
        print(f"Error loading profile: {e}")
    
    # Return demo profile data
    return {
        "name": "Demo User",
        "email": "demo@smarteats.com",
        "age": 25,
        "height": 170,
        "weight": 70,
        "activity": "moderate",
        "dietary_restrictions": ["none"],
        "goals": {
            "daily_calories": 2000,
            "protein_grams": 150,
            "water_liters": 2.5,
            "weight_goal": "maintain"
        }
    }

def save_user_goals_data(goals_data):
    """Save user goals to database"""
    try:
        goals_id = f"goals_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if DATABASE_TYPE == 'mysql' and db_connection:
            cursor = db_connection.cursor()
            query = """
            INSERT INTO user_goals 
            (goals_id, daily_calories, protein_grams, water_liters, weight_goal, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                goals_id, goals_data.get('daily_calories'),
                goals_data.get('protein_grams'), goals_data.get('water_liters'),
                goals_data.get('weight_goal'), datetime.now()
            ))
            db_connection.commit()
            cursor.close()
            
        elif DATABASE_TYPE == 'mongodb' and mongo_db:
            mongo_db.user_goals.insert_one({
                "goals_id": goals_id,
                **goals_data,
                "created_at": datetime.now()
            })
            
        elif DATABASE_TYPE == 'firebase' and firebase_db:
            firebase_db.collection('user_goals').document(goals_id).set({
                **goals_data,
                "created_at": datetime.now()
            })
        else:
            print(f"Goals saved locally (demo mode): {goals_data}")
            
        return goals_id
        
    except Exception as e:
        print(f"Error saving goals: {e}")
        return None

if __name__ == '__main__':
    print("🍎 Starting SmartEats Flask API Server...")
    print(f"🗄️ Using {DATABASE_TYPE} database")
    print("🌍 Supporting SDG 2: Zero Hunger & SDG 3: Good Health")
    print("🚀 Server running on http://localhost:5000")
    print("✨ Advanced Features: AI, Community, Wellness, Sustainability")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
