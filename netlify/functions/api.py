"""
SmartEats Netlify Serverless Function
Hackathon 2025 - SDG 2 & SDG 3 Solution
"""

import json
import os
from datetime import datetime
import hashlib
import requests

def handler(event, context):
    """
    Main handler for all API endpoints
    """
    
    # Get the request method and path
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '').replace('/.netlify/functions/api', '')
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle CORS preflight
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Route the request
        if path == '/health':
            return handle_health(event, headers)
        elif path == '/nutrition/calculate':
            return handle_nutrition_calculate(event, headers)
        elif path.startswith('/ai/'):
            return handle_ai_request(event, headers, path)
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint not found'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def handle_health(event, headers):
    """Health check endpoint"""
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'status': 'healthy',
            'message': 'SmartEats Serverless API is running',
            'timestamp': datetime.now().isoformat(),
            'sdg_goals': ['SDG 2: Zero Hunger', 'SDG 3: Good Health and Well-Being']
        })
    }

def handle_nutrition_calculate(event, headers):
    """Calculate personalized nutrition needs"""
    
    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate input
        required_fields = ['age', 'gender', 'height', 'weight', 'activity']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': f'Missing field: {field}'})
                }
        
        # Calculate nutrition values
        results = calculate_nutrition_values(body)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'results': results,
                'message': 'Nutrition calculated successfully'
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

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
        'bmi': round(bmi, 1),
        'bmr': round(bmr),
        'tdee': round(tdee),
        'calories': round(tdee),
        'protein': round(protein),
        'carbs': round(carbs),
        'fat': round(fat),
        'water': round(water, 1)
    }

def handle_ai_request(event, headers, path):
    """Handle AI-related requests"""
    
    # Get Hugging Face API key from environment
    api_key = os.environ.get('HUGGING_FACE_API_KEY')
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'AI service not configured'})
        }
    
    if path == '/ai/chat' and event.get('httpMethod') == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            question = body.get('question', '')
            
            if not question:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Question is required'})
                }
            
            # Simple AI response (you can enhance this with actual API calls)
            response_text = generate_ai_response(question, api_key)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'response': response_text,
                    'timestamp': datetime.now().isoformat()
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 404,
        'headers': headers,
        'body': json.dumps({'error': 'AI endpoint not found'})
    }

def generate_ai_response(question, api_key):
    """Generate AI response (simplified for demo)"""
    
    # Basic nutrition responses (you can enhance with actual AI API calls)
    nutrition_responses = {
        'protein': 'Protein is essential for muscle building and repair. Aim for 0.8-1.2g per kg of body weight daily.',
        'carbs': 'Carbohydrates provide energy for your body. Choose complex carbs like whole grains and vegetables.',
        'fat': 'Healthy fats are important for hormone production. Include sources like avocados, nuts, and olive oil.',
        'calories': 'Your calorie needs depend on age, gender, height, weight, and activity level. Use our calculator for personalized recommendations.',
        'water': 'Stay hydrated by drinking at least 35ml of water per kg of body weight daily.',
        'bmi': 'BMI is calculated as weight(kg) / height(m)². It\'s a screening tool but doesn\'t measure body composition.',
        'weight loss': 'Healthy weight loss is 0.5-1 kg per week through a combination of diet and exercise.',
        'muscle gain': 'For muscle gain, combine resistance training with adequate protein intake and progressive overload.'
    }
    
    question_lower = question.lower()
    
    # Simple keyword matching
    for keyword, response in nutrition_responses.items():
        if keyword in question_lower:
            return f"🍎 SmartEats AI: {response}"
    
    # Default response
    return "🍎 SmartEats AI: I'm here to help with your nutrition questions! Ask me about calories, macronutrients, healthy eating, or use our nutrition calculator for personalized recommendations."
