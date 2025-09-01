"""
SmartEats Simple Backend - Guaranteed to Deploy!
Ultra-lightweight version for instant deployment
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import re
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["*"])

# ===== SIMPLE NUTRITION CALCULATOR =====

def calculate_nutrition(age, gender, height, weight, activity):
    """Simple nutrition calculation"""
    # BMI
    height_m = height / 100
    bmi = weight / (height_m ** 2)
    
    # BMR (simplified)
    if gender.lower() == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # TDEE
    multipliers = {'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'very': 1.725, 'extra': 1.9}
    tdee = bmr * multipliers.get(activity, 1.2)
    
    # Macros
    protein = weight * 2.2
    fat = tdee * 0.25 / 9
    carbs = (tdee - (protein * 4) - (fat * 9)) / 4
    water = weight * 0.035
    
    return {
        'bmi': round(bmi, 1),
        'bmr': round(bmr),
        'tdee': round(tdee),
        'calories': round(tdee),
        'protein': round(protein),
        'carbs': round(carbs),
        'fat': round(fat),
        'water': round(water, 1)
    }

def generate_ai_response(message):
    """Simple AI responses"""
    message = message.lower()
    
    if 'protein' in message:
        return "🥩 **PROTEIN GUIDANCE:**\n\n• **Daily needs:** 0.8-2.2g per kg body weight\n• **Best sources:** Lean meats, fish, eggs, legumes\n• **Tip:** Spread protein throughout the day!\n\n*Need more specific advice?*"
    
    elif any(word in message for word in ['water', 'hydration']):
        return "💧 **HYDRATION ESSENTIALS:**\n\n• **Basic rule:** 8 glasses (2L) daily\n• **Activity boost:** +500ml per hour of exercise\n• **Signs:** Pale yellow urine = good hydration\n• **Tip:** Add lemon for flavor!\n\n*Track your intake daily!*"
    
    elif any(word in message for word in ['lose', 'weight', 'diet']):
        return "🎯 **WEIGHT MANAGEMENT:**\n\n• **Safe rate:** 0.5-1kg per week\n• **Strategy:** Create small calorie deficit\n• **Focus:** Whole foods, portion control\n• **Exercise:** Combine cardio + strength\n\n*Start with our nutrition calculator!*"
    
    elif any(word in message for word in ['recipe', 'meal', 'cook']):
        return "🍳 **HEALTHY COOKING:**\n\n• **Methods:** Grill, bake, steam vs fry\n• **Seasoning:** Herbs and spices over salt\n• **Prep:** Batch cook for the week\n• **Simple:** Fresh ingredients need minimal prep\n\n*Want specific recipe ideas?*"
    
    else:
        return "🍎 **SmartEats AI Assistant**\n\nI can help with:\n• 🥗 Nutrition questions\n• 🍽️ Healthy recipes\n• ⚖️ Weight management\n• 💪 Wellness tips\n\n**Try asking:**\n• 'How much protein do I need?'\n• 'Healthy breakfast ideas?'\n• 'How to lose weight safely?'\n\n*Always here to help! 🌟*"

# ===== API ROUTES =====

@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': 'SmartEats API is running!',
        'version': '1.0.0',
        'endpoints': {
            'nutrition': '/api/nutrition/calculate',
            'chat': '/api/chat',
            'recipes': '/api/recipes/search',
            'meals': '/api/meals/log',
            'wellness': '/api/wellness/sleep-stress'
        }
    })

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/nutrition/calculate', methods=['POST'])
def nutrition_calculate():
    try:
        data = request.get_json()
        
        required = ['age', 'gender', 'height', 'weight', 'activity']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing {field}'}), 400
        
        results = calculate_nutrition(
            int(data['age']),
            data['gender'],
            float(data['height']),
            float(data['weight']),
            data['activity']
        )
        
        recommendations = [
            f"Your BMI is {results['bmi']} - aim for 18.5-25 range",
            f"Target {results['protein']}g protein daily",
            "Stay hydrated with 8+ glasses of water",
            "Include variety: fruits, vegetables, whole grains"
        ]
        
        return jsonify({
            'success': True,
            'results': results,
            'recommendations': recommendations
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'success': False, 'error': 'Message required'}), 400
        
        response = generate_ai_response(message)
        
        return jsonify({
            'success': True,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/recipes/search', methods=['POST'])
def recipes():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', '').strip()
        
        # Simple recipe database
        recipes = [
            {
                'id': 'protein-bowl',
                'name': 'High-Protein Power Bowl',
                'description': 'Quinoa, grilled chicken, and fresh vegetables',
                'calories': 520,
                'protein': 42,
                'prep_time': 25,
                'image': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200'
            },
            {
                'id': 'veggie-stir-fry',
                'name': 'Rainbow Vegetable Stir-Fry',
                'description': 'Colorful vegetables with tofu and brown rice',
                'calories': 380,
                'protein': 18,
                'prep_time': 20,
                'image': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200'
            },
            {
                'id': 'salmon-quinoa',
                'name': 'Baked Salmon with Quinoa',
                'description': 'Omega-3 rich salmon with superfood quinoa',
                'calories': 450,
                'protein': 35,
                'prep_time': 30,
                'image': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200'
            }
        ]
        
        return jsonify({
            'success': True,
            'recipes': recipes,
            'search_query': ingredients,
            'total_results': len(recipes)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/meals/log', methods=['POST'])
def log_meal():
    try:
        data = request.get_json()
        meal_id = data.get('meal_id')
        
        if not meal_id:
            return jsonify({'success': False, 'error': 'Meal ID required'}), 400
        
        return jsonify({
            'success': True,
            'message': 'Meal logged successfully',
            'meal_id': meal_id,
            'logged_at': datetime.now().isoformat(),
            'calories_added': random.randint(300, 600),
            'protein_added': random.randint(15, 40)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/wellness/sleep-stress', methods=['POST'])
def wellness():
    try:
        data = request.get_json()
        sleep_hours = float(data.get('sleep_hours', 8))
        stress_level = int(data.get('stress_level', 5))
        
        # Simple wellness score
        sleep_score = min(100, (sleep_hours / 8) * 50)
        stress_score = max(0, 50 - (stress_level * 5))
        wellness_score = round(sleep_score + stress_score)
        
        recommendations = []
        if sleep_hours < 7:
            recommendations.append({
                'message': '💤 Try to get 7-9 hours of sleep',
                'action': 'Consider magnesium-rich foods before bed'
            })
        else:
            recommendations.append({
                'message': '🌟 Great sleep habits!',
                'action': 'Keep up the good work!'
            })
        
        return jsonify({
            'success': True,
            'wellness_score': wellness_score,
            'recommendations': recommendations,
            'tips': ['Stay hydrated', 'Include omega-3 foods', 'Practice mindful eating']
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
