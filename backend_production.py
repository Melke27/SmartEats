"""
SmartEats Production Backend API
Ready for deployment on Render, Railway, or Heroku
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import json
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'smarteats-production-key-2025')

# Configure CORS for production
CORS(app, origins=["*"])  # Configure specific domains in production

# ===== NUTRITION CALCULATOR =====

class NutritionCalculator:
    @staticmethod
    def calculate_bmr(weight, height, age, gender):
        """Calculate BMR using Mifflin-St Jeor Equation"""
        try:
            weight = float(weight)
            height = float(height)
            age = int(age)
            
            if gender.lower() == 'male':
                return 10 * weight + 6.25 * height - 5 * age + 5
            else:
                return 10 * weight + 6.25 * height - 5 * age - 161
        except (ValueError, TypeError):
            raise ValueError("Invalid input parameters for BMR calculation")
    
    @staticmethod
    def calculate_tdee(bmr, activity_level):
        """Calculate TDEE with activity multipliers"""
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
        """Calculate macro and micronutrient needs"""
        try:
            tdee = float(tdee)
            weight = float(weight)
            
            if goal == 'lose':
                calories = tdee - 500
            elif goal == 'gain':
                calories = tdee + 300
            else:
                calories = tdee
            
            # Macronutrients
            protein = weight * 2.2  # 2.2g per kg
            fat = calories * 0.25 / 9  # 25% calories from fat
            carbs = (calories - (protein * 4) - (fat * 9)) / 4
            
            # Water needs
            water = weight * 0.035  # 35ml per kg
            
            # BMI calculation
            height_m = 175 / 100  # Default height for calculation
            bmi = weight / (height_m ** 2)
            
            return {
                'calories': round(calories),
                'protein': round(protein),
                'carbs': round(carbs),
                'fat': round(fat),
                'water': round(water, 1),
                'bmi': round(bmi, 1),
                'bmr': round(tdee / 1.55),  # Approximate BMR
                'tdee': round(tdee)
            }
        except (ValueError, TypeError):
            raise ValueError("Invalid input parameters for macro calculation")

# ===== AI NUTRITION BOT =====

class AINutritionBot:
    def __init__(self):
        self.language_patterns = {
            'ar': re.compile(r'[؀-ۿ]'),
            'am': re.compile(r'[ሀ-፿]'),
            'sw': re.compile(r'\\b(habari|chakula|afya|maji|protein)\\b', re.I),
            'fr': re.compile(r'\\b(bonjour|nutrition|santé|eau|protéine)\\b', re.I),
            'es': re.compile(r'\\b(hola|nutrición|salud|agua|proteína)\\b', re.I),
            'hi': re.compile(r'[ऀ-ॿ]'),
            'zh': re.compile(r'[一-鿿]'),
            'ja': re.compile(r'[぀-ゟ゠-ヿ一-龯]'),
            'ko': re.compile(r'[가-힯]'),
            'ru': re.compile(r'[Ѐ-ӿ]'),
        }
        
        self.responses = {
            'protein': {
                'en': "🥩 **PROTEIN GUIDANCE:**\n\n• **Daily needs:** 0.8-2.2g per kg body weight\n• **Athletes:** Up to 2.2g/kg for muscle building\n• **Best sources:** Lean meats, fish, eggs, legumes, Greek yogurt, quinoa\n• **Tip:** Spread protein throughout the day for better absorption!\n\n*Would you like specific protein-rich recipe ideas?*",
                'ar': "🥩 **دليل البروتين:**\n\n• **الحاجة اليومية:** 0.8-2.2 جرام لكل كيلو من وزن الجسم\n• **للرياضيين:** حتى 2.2 جرام/كيلو لبناء العضلات\n• **أفضل المصادر:** اللحوم الخالية من الدهون، السمك، البيض، البقوليات، الزبادي اليوناني، الكينوا",
                'fr': "🥩 **GUIDE PROTÉINES:**\n\n• **Besoins quotidiens:** 0,8-2,2g par kg de poids corporel\n• **Athlètes:** Jusqu'à 2,2g/kg pour la construction musculaire",
                'es': "🥩 **GUÍA DE PROTEÍNAS:**\n\n• **Necesidades diarias:** 0.8-2.2g por kg de peso corporal\n• **Atletas:** Hasta 2.2g/kg para construcción muscular",
                'sw': "🥩 **MWONGOZO WA PROTINI:**\n\n• **Mahitaji ya kila siku:** 0.8-2.2g kwa kilo ya uzito wa mwili\n• **Wanariadha:** Hadi 2.2g/kilo kwa kujenga misuli"
            },
            'hydration': {
                'en': "💧 **HYDRATION ESSENTIALS:**\n\n• **Basic rule:** 8 glasses (2L) daily minimum\n• **Activity boost:** +500ml per hour of exercise\n• **Climate factor:** More in hot/humid weather\n• **Quality signs:** Pale yellow urine, good energy levels\n• **Flavor tips:** Add lemon, cucumber, or mint!\n\n*Track your intake with our water logging feature!*",
                'ar': "💧 **أساسيات الترطيب:**\n\n• **القاعدة الأساسية:** 8 أكواب (2 لتر) يومياً كحد أدنى\n• **زيادة النشاط:** +500 مل لكل ساعة تمرين",
                'fr': "💧 **ESSENTIELS D'HYDRATATION:**\n\n• **Règle de base:** 8 verres (2L) minimum par jour\n• **Boost d'activité:** +500ml par heure d'exercice",
                'es': "💧 **ESENCIALES DE HIDRATACIÓN:**\n\n• **Regla básica:** 8 vasos (2L) mínimo diario\n• **Impulso de actividad:** +500ml por hora de ejercicio",
                'sw': "💧 **MAMBO MUHIMU YA MAJI:**\n\n• **Kanuni ya msingi:** Vikombe 8 (lita 2) kwa siku\n• **Kuongeza shughuli:** +500ml kwa saa ya mazoezi"
            }
        }
    
    def detect_language(self, message):
        for lang, pattern in self.language_patterns.items():
            if pattern.search(message):
                return lang
        return 'en'
    
    def generate_response(self, message, user_context=None):
        try:
            language = self.detect_language(message)
            message_lower = message.lower()
            
            # Detect intent
            if any(word in message_lower for word in ['protein', 'protéine', 'proteína', 'protini']):
                response_data = self.responses.get('protein', {})
                return response_data.get(language, response_data.get('en'))
            
            elif any(word in message_lower for word in ['water', 'hydration', 'eau', 'agua', 'maji']):
                response_data = self.responses.get('hydration', {})
                return response_data.get(language, response_data.get('en'))
            
            elif any(word in message_lower for word in ['lose weight', 'diet', 'slim']):
                return "🎯 **WEIGHT LOSS STRATEGY:**\\n\\n• **Create deficit:** Eat less + move more (safely!)\\n• **Meal timing:** Don't skip meals\\n• **Protein priority:** Keeps you full\\n• **Sleep matters:** 7-9 hours for hormone balance\\n• **Be patient:** Healthy loss takes time but lasts!\\n\\n*Start with our personalized nutrition plan!*"
            
            elif any(word in message_lower for word in ['calories', 'energy']):
                return "🔥 **CALORIE WISDOM:**\\n\\n• **Individual needs:** Vary by age, gender, activity\\n• **Quality matters:** 100 cal of apple ≠ 100 cal of candy\\n• **Don't go too low:** Minimum 1200 for women, 1500 for men\\n• **Track trends:** Weekly averages matter most\\n\\n*Use our calculator for personalized needs!*"
            
            elif any(word in message_lower for word in ['recipe', 'meal', 'cook']):
                return "🍳 **HEALTHY COOKING TIPS:**\\n\\n• **Methods:** Grill, bake, steam vs. deep fry\\n• **Seasoning:** Herbs and spices instead of salt\\n• **Meal prep:** Batch cook proteins and grains\\n• **Keep simple:** Fresh ingredients need minimal prep\\n\\n*Want easy, healthy recipes to start with?*"
            
            else:
                return "🍎 **I'M YOUR NUTRITION ASSISTANT!**\\n\\nI can help with:\\n• 🥗 Nutrition questions (calories, protein, vitamins)\\n• 🍽️ Healthy recipes and meal ideas\\n• ⚖️ Weight management strategies\\n• 💪 Wellness tips\\n\\n**Try asking:**\\n• 'How much protein do I need?'\\n• 'What are healthy breakfast ideas?'\\n• 'How can I lose weight safely?'\\n\\n*I'm always learning to help you better! 🌟*"
        
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return "🍎 **SmartEats AI Assistant**\\n\\nI'm here to help with your nutrition questions! Ask me about proteins, hydration, weight management, or healthy recipes."

# Initialize AI bot
ai_bot = AINutritionBot()

# ===== API ROUTES =====

@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': 'SmartEats API is running!',
        'version': '2.0.0',
        'endpoints': {
            'nutrition': '/api/nutrition/calculate',
            'chat': '/api/chat',
            'recipes': '/api/recipes/search',
            'meals': '/api/meals/log',
            'wellness': '/api/wellness/sleep-stress'
        }
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0'
    })

@app.route('/api/nutrition/calculate', methods=['POST'])
def calculate_nutrition():
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['age', 'gender', 'height', 'weight', 'activity']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate nutrition
        calculator = NutritionCalculator()
        
        # Calculate BMR
        bmr = calculator.calculate_bmr(
            data['weight'], 
            data['height'], 
            data['age'], 
            data['gender']
        )
        
        # Calculate TDEE
        tdee = calculator.calculate_tdee(bmr, data['activity'])
        
        # Calculate macros
        macros = calculator.calculate_macros(tdee, data['weight'])
        macros['bmr'] = round(bmr)
        macros['tdee'] = round(tdee)
        
        # Calculate BMI
        height_m = float(data['height']) / 100
        bmi = float(data['weight']) / (height_m ** 2)
        macros['bmi'] = round(bmi, 1)
        
        logger.info(f"Nutrition calculated for user: {data['gender']}, {data['age']}y")
        
        return jsonify({
            'success': True,
            'results': macros,
            'recommendations': generate_nutrition_recommendations(macros, data)
        })
    
    except Exception as e:
        logger.error(f"Nutrition calculation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate nutrition needs'
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        # Generate AI response
        response = ai_bot.generate_response(message)
        
        logger.info(f"Chat interaction: {len(message)} chars in, {len(response)} chars out")
        
        return jsonify({
            'success': True,
            'response': response,
            'language': ai_bot.detect_language(message),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to process chat message'
        }), 500

@app.route('/api/recipes/search', methods=['POST'])
def search_recipes():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '').strip()
        
        if not ingredients:
            return jsonify({
                'success': False,
                'error': 'Ingredients are required'
            }), 400
        
        # Sample recipe database (in production, use real recipe API)
        sample_recipes = [
            {
                'id': 'protein-bowl',
                'name': 'High-Protein Power Bowl',
                'description': 'Quinoa, grilled chicken, and fresh vegetables',
                'ingredients': ['quinoa', 'chicken', 'spinach', 'avocado'],
                'calories': 520,
                'protein': 42,
                'prep_time': 25,
                'image': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200',
                'instructions': ['Cook quinoa', 'Grill chicken', 'Assemble bowl'],
                'sustainability_score': 85
            },
            {
                'id': 'veggie-stir-fry',
                'name': 'Rainbow Vegetable Stir-Fry',
                'description': 'Colorful vegetables with tofu and brown rice',
                'ingredients': ['tofu', 'broccoli', 'bell peppers', 'brown rice'],
                'calories': 380,
                'protein': 18,
                'prep_time': 20,
                'image': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200',
                'instructions': ['Prepare vegetables', 'Cook tofu', 'Stir-fry together'],
                'sustainability_score': 95
            },
            {
                'id': 'salmon-quinoa',
                'name': 'Baked Salmon with Quinoa',
                'description': 'Omega-3 rich salmon with superfood quinoa',
                'ingredients': ['salmon', 'quinoa', 'asparagus', 'lemon'],
                'calories': 450,
                'protein': 35,
                'prep_time': 30,
                'image': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200',
                'instructions': ['Season salmon', 'Cook quinoa', 'Bake together'],
                'sustainability_score': 78
            }
        ]
        
        # Filter recipes based on ingredients (simple keyword matching)
        ingredient_list = [ing.strip().lower() for ing in ingredients.split(',')]
        filtered_recipes = []
        
        for recipe in sample_recipes:
            recipe_ingredients = [ing.lower() for ing in recipe['ingredients']]
            if any(ing in ' '.join(recipe_ingredients) for ing in ingredient_list):
                filtered_recipes.append(recipe)
        
        # If no matches, return all recipes
        if not filtered_recipes:
            filtered_recipes = sample_recipes
        
        logger.info(f"Recipe search for: {ingredients}, found {len(filtered_recipes)} recipes")
        
        return jsonify({
            'success': True,
            'recipes': filtered_recipes,
            'search_query': ingredients,
            'total_results': len(filtered_recipes)
        })
    
    except Exception as e:
        logger.error(f"Recipe search error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to search recipes'
        }), 500

@app.route('/api/meals/log', methods=['POST'])
def log_meal():
    try:
        data = request.get_json()
        meal_id = data.get('meal_id')
        
        if not meal_id:
            return jsonify({
                'success': False,
                'error': 'Meal ID is required'
            }), 400
        
        # In production, save to database
        # For now, return success with sample data
        
        logger.info(f"Meal logged: {meal_id}")
        
        return jsonify({
            'success': True,
            'message': 'Meal logged successfully',
            'meal_id': meal_id,
            'logged_at': datetime.now().isoformat(),
            'calories_added': random.randint(300, 600),
            'protein_added': random.randint(15, 40)
        })
    
    except Exception as e:
        logger.error(f"Meal logging error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to log meal'
        }), 500

@app.route('/api/wellness/sleep-stress', methods=['POST'])
def wellness_tracking():
    try:
        data = request.get_json()
        sleep_hours = float(data.get('sleep_hours', 8))
        stress_level = int(data.get('stress_level', 5))
        
        # Calculate wellness score
        sleep_score = min(100, (sleep_hours / 8) * 50)
        stress_score = max(0, 50 - (stress_level * 5))
        wellness_score = round(sleep_score + stress_score)
        
        # Generate recommendations
        recommendations = []
        
        if sleep_hours < 7:
            recommendations.append({
                'message': '💤 Try to get 7-9 hours of sleep',
                'action': 'Consider magnesium-rich foods before bed'
            })
        elif sleep_hours > 9:
            recommendations.append({
                'message': '😴 You might be oversleeping',
                'action': 'Consistent sleep schedule helps energy levels'
            })
        else:
            recommendations.append({
                'message': '🌟 Great sleep habits!',
                'action': 'Keep up the good work!'
            })
        
        if stress_level > 7:
            recommendations.append({
                'message': '😰 High stress detected',
                'action': 'Try meditation, deep breathing, or light exercise'
            })
        elif stress_level > 5:
            recommendations.append({
                'message': '😌 Moderate stress levels',
                'action': 'Consider stress-reducing foods like dark chocolate or green tea'
            })
        else:
            recommendations.append({
                'message': '😊 Low stress levels',
                'action': 'Maintain your healthy lifestyle!'
            })
        
        logger.info(f"Wellness tracked: {sleep_hours}h sleep, stress {stress_level}/10")
        
        return jsonify({
            'success': True,
            'wellness_score': wellness_score,
            'sleep_score': round(sleep_score),
            'stress_score': round(stress_score),
            'recommendations': recommendations,
            'tips': [
                'Stay hydrated throughout the day',
                'Include omega-3 rich foods for brain health',
                'Practice mindful eating'
            ]
        })
    
    except Exception as e:
        logger.error(f"Wellness tracking error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to process wellness data'
        }), 500

# ===== HELPER FUNCTIONS =====

def generate_nutrition_recommendations(macros, user_data):
    """Generate personalized nutrition recommendations"""
    recommendations = []
    
    bmi = macros.get('bmi', 0)
    calories = macros.get('calories', 0)
    protein = macros.get('protein', 0)
    
    # BMI recommendations
    if bmi < 18.5:
        recommendations.append("Consider gaining weight with nutrient-dense foods")
    elif bmi > 25:
        recommendations.append("Focus on portion control and regular exercise")
    else:
        recommendations.append("Maintain your healthy weight with balanced nutrition")
    
    # Protein recommendations
    if user_data.get('activity') in ['very', 'extra']:
        recommendations.append(f"As an active person, aim for {protein}g protein daily")
    else:
        recommendations.append(f"Target {protein}g protein spread throughout the day")
    
    # General recommendations
    recommendations.append("Stay hydrated with 8+ glasses of water daily")
    recommendations.append("Include variety: fruits, vegetables, whole grains, lean proteins")
    
    return recommendations

# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': [
            '/api/nutrition/calculate',
            '/api/chat',
            '/api/recipes/search',
            '/api/meals/log',
            '/api/wellness/sleep-stress'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

# ===== MAIN =====

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting SmartEats API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
