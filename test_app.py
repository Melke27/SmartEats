"""
SmartEats Test Suite
Comprehensive tests for backend API functionality
Hackathon 2025 - SDG 2 & SDG 3 Solution
"""

import pytest
import json
from datetime import datetime
from app import app, db, User, UserProfile, MealLog, Achievement

@pytest.fixture
def client():
    """Create a test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            
            # Create sample achievements
            achievements = [
                Achievement(name='Daily Meal Master', description='Log 3 meals in one day', 
                           badge_emoji='🍽️', points=50, category='meals'),
                Achievement(name='Hydration Hero', description='Meet daily water goal', 
                           badge_emoji='💧', points=30, category='hydration'),
                Achievement(name='Weekly Warrior', description='7-day tracking streak', 
                           badge_emoji='🔥', points=100, category='consistency')
            ]
            
            for achievement in achievements:
                db.session.add(achievement)
            db.session.commit()
            
        yield client

@pytest.fixture
def authenticated_user(client):
    """Create and authenticate a test user"""
    # Register user
    user_data = {
        'name': 'Test User',
        'email': 'test@smarteats.com',
        'password': 'testpassword123'
    }
    
    response = client.post('/api/auth/register', 
                         data=json.dumps(user_data),
                         content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    return data['access_token']

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_user_registration(self, client):
        """Test user registration"""
        user_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'securepass123'
        }
        
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'access_token' in data
        assert data['user']['name'] == 'John Doe'
        assert data['user']['email'] == 'john@example.com'
    
    def test_duplicate_email_registration(self, client):
        """Test registration with duplicate email"""
        user_data = {
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'password': 'password123'
        }
        
        # Register user first time
        client.post('/api/auth/register', 
                   data=json.dumps(user_data),
                   content_type='application/json')
        
        # Try to register again with same email
        response = client.post('/api/auth/register', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'already registered' in data['message']
    
    def test_user_login(self, client):
        """Test user login"""
        # Register user first
        user_data = {
            'name': 'Login User',
            'email': 'login@example.com',
            'password': 'loginpass123'
        }
        
        client.post('/api/auth/register', 
                   data=json.dumps(user_data),
                   content_type='application/json')
        
        # Now login
        login_data = {
            'email': 'login@example.com',
            'password': 'loginpass123'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'access_token' in data
    
    def test_invalid_login(self, client):
        """Test login with invalid credentials"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        response = client.post('/api/auth/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'Invalid credentials' in data['message']

class TestNutrition:
    """Test nutrition calculation endpoints"""
    
    def test_nutrition_calculation(self, client, authenticated_user):
        """Test personalized nutrition calculation"""
        nutrition_data = {
            'age': 25,
            'gender': 'female',
            'height': 165,
            'weight': 60,
            'activity': 'moderate'
        }
        
        headers = {'Authorization': f'Bearer {authenticated_user}'} 
        
        response = client.post('/api/nutrition/calculate', 
                             data=json.dumps(nutrition_data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        
        results = data['results']
        assert 'bmi' in results
        assert 'bmr' in results
        assert 'tdee' in results
        assert 'calories' in results
        assert 'protein' in results
        assert 'carbs' in results
        assert 'fat' in results
        assert 'water' in results
        
        # Check reasonable ranges
        assert 18 <= results['bmi'] <= 25  # Normal BMI range
        assert 1200 <= results['bmr'] <= 2000  # Reasonable BMR
        assert 1500 <= results['calories'] <= 3000  # Reasonable TDEE
    
    def test_food_nutrition_lookup(self, client):
        """Test food nutrition lookup"""
        food_data = {'food': 'banana'}
        
        response = client.post('/api/nutrition/lookup', 
                             data=json.dumps(food_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        
        nutrition = data['nutrition']
        assert 'calories' in nutrition
        assert 'protein' in nutrition
        assert 'carbs' in nutrition
        assert 'fat' in nutrition
        assert 'fiber' in nutrition
    
    def test_unknown_food_lookup(self, client):
        """Test lookup of unknown food"""
        food_data = {'food': 'unknownfooditem12345'}
        
        response = client.post('/api/nutrition/lookup', 
                             data=json.dumps(food_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        # Should return default values
        assert data['nutrition']['calories'] == 100

class TestMealLogging:
    """Test meal logging endpoints"""
    
    def test_meal_logging(self, client, authenticated_user):
        """Test logging a meal"""
        meal_data = {
            'meal_name': 'Grilled Chicken Salad',
            'calories': 350,
            'protein': 30,
            'carbs': 20,
            'fat': 15,
            'meal_type': 'lunch'
        }
        
        headers = {'Authorization': f'Bearer {authenticated_user}'}
        
        response = client.post('/api/meals/log', 
                             data=json.dumps(meal_data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'meal_id' in data
    
    def test_get_todays_meals(self, client, authenticated_user):
        """Test getting today's meals"""
        # First log some meals
        meals = [
            {'meal_name': 'Breakfast', 'calories': 300, 'protein': 15, 'meal_type': 'breakfast'},
            {'meal_name': 'Lunch', 'calories': 400, 'protein': 25, 'meal_type': 'lunch'},
            {'meal_name': 'Dinner', 'calories': 500, 'protein': 30, 'meal_type': 'dinner'}
        ]
        
        headers = {'Authorization': f'Bearer {authenticated_user}'}
        
        for meal in meals:
            client.post('/api/meals/log', 
                       data=json.dumps(meal),
                       content_type='application/json',
                       headers=headers)
        
        # Get today's meals
        response = client.get('/api/meals/today', headers=headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert len(data['meals']) == 3
        assert data['totals']['meal_count'] == 3
        assert data['totals']['calories'] == 1200
        assert data['totals']['protein'] == 70

class TestAIChat:
    """Test AI chat functionality"""
    
    def test_chat_general_query(self, client):
        """Test general nutrition query"""
        chat_data = {'message': 'What is protein?'}
        
        response = client.post('/api/chat', 
                             data=json.dumps(chat_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'protein' in data['response'].lower()
        assert 'timestamp' in data
    
    def test_chat_multilingual_query(self, client):
        """Test multilingual chat query"""
        chat_data = {'message': 'Qué es la proteína?'}  # Spanish
        
        response = client.post('/api/chat', 
                             data=json.dumps(chat_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert len(data['response']) > 50  # Should get a detailed response
    
    def test_voice_processing(self, client):
        """Test voice command processing"""
        voice_data = {
            'text': 'How much water should I drink daily?',
            'language': 'en'
        }
        
        response = client.post('/api/voice/process', 
                             data=json.dumps(voice_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'water' in data['response'].lower()

class TestCommunity:
    """Test community features"""
    
    def test_leaderboard(self, client):
        """Test community leaderboard"""
        response = client.get('/api/community/leaderboard')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'leaderboard' in data
        assert len(data['leaderboard']) > 0
        
        # Check leaderboard structure
        first_user = data['leaderboard'][0]
        assert 'rank' in first_user
        assert 'username' in first_user
        assert 'score' in first_user
        assert 'streak' in first_user
    
    def test_weekly_challenges(self, client):
        """Test weekly challenges"""
        response = client.get('/api/challenges/weekly')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'challenges' in data
        assert len(data['challenges']) > 0
        
        # Check challenge structure
        challenge = data['challenges'][0]
        assert 'id' in challenge
        assert 'title' in challenge
        assert 'description' in challenge
        assert 'progress' in challenge
        assert 'target' in challenge

class TestWellness:
    """Test wellness tracking"""
    
    def test_sleep_stress_tracking(self, client, authenticated_user):
        """Test sleep and stress tracking"""
        wellness_data = {
            'sleep_hours': 7.5,
            'stress_level': 4
        }
        
        headers = {'Authorization': f'Bearer {authenticated_user}'}
        
        response = client.post('/api/wellness/sleep-stress', 
                             data=json.dumps(wellness_data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'wellness_score' in data
        assert 'recommendations' in data
        assert len(data['recommendations']) > 0
        assert 0 <= data['wellness_score'] <= 100

class TestSustainability:
    """Test sustainability features"""
    
    def test_sustainability_score_calculation(self, client):
        """Test sustainability score calculation"""
        meals_data = {
            'meals': [
                {'name': 'Quinoa vegetable bowl'},
                {'name': 'Grilled chicken salad'},
                {'name': 'Tofu stir fry'},
                {'name': 'Fruit smoothie'}
            ]
        }
        
        response = client.post('/api/sustainability/score', 
                             data=json.dumps(meals_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'sustainability_score' in data
        assert 'carbon_footprint' in data
        assert 'water_usage' in data
        assert 'recommendations' in data
        assert 0 <= data['sustainability_score'] <= 100
    
    def test_empty_meals_sustainability(self, client):
        """Test sustainability with no meals"""
        meals_data = {'meals': []}
        
        response = client.post('/api/sustainability/score', 
                             data=json.dumps(meals_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] == False

class TestGroceryList:
    """Test grocery list generation"""
    
    def test_grocery_list_generation(self, client, authenticated_user):
        """Test grocery list generation"""
        list_data = {'days': 7}
        
        headers = {'Authorization': f'Bearer {authenticated_user}'}
        
        response = client.post('/api/grocery/generate-list', 
                             data=json.dumps(list_data),
                             content_type='application/json',
                             headers=headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'grocery_list' in data
        assert 'sustainability_tips' in data
        
        grocery_list = data['grocery_list']
        assert 'categories' in grocery_list
        assert 'estimated_cost' in grocery_list

class TestDonations:
    """Test donation impact calculations"""
    
    def test_donation_impact_calculation(self, client):
        """Test donation impact calculation"""
        donation_data = {
            'amount': 25.0,
            'currency': 'USD'
        }
        
        response = client.post('/api/donation/contribute', 
                             data=json.dumps(donation_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'impact_message' in data
        assert 'breakdown' in data
        assert 'meals_provided' in data['breakdown']
        assert data['breakdown']['meals_provided'] > 0
    
    def test_invalid_donation_amount(self, client):
        """Test invalid donation amount"""
        donation_data = {
            'amount': -5.0,
            'currency': 'USD'
        }
        
        response = client.post('/api/donation/contribute', 
                             data=json.dumps(donation_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] == False

class TestRecipeSearch:
    """Test recipe search functionality"""
    
    def test_recipe_search(self, client):
        """Test recipe search with ingredients"""
        recipe_data = {'ingredients': 'chicken, broccoli, quinoa'}
        
        response = client.post('/api/recipes/search', 
                             data=json.dumps(recipe_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'recipes' in data
        assert len(data['recipes']) > 0
        
        # Check recipe structure
        recipe = data['recipes'][0]
        assert 'name' in recipe
        assert 'description' in recipe
        assert 'calories' in recipe
        assert 'protein' in recipe
        assert 'prep_time' in recipe

class TestErrorHandling:
    """Test error handling"""
    
    def test_404_endpoint(self, client):
        """Test 404 error for non-existent endpoint"""
        response = client.get('/api/nonexistent')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'not found' in data['message'].lower()
    
    def test_unauthorized_access(self, client):
        """Test unauthorized access to protected endpoint"""
        response = client.post('/api/nutrition/calculate', 
                             data=json.dumps({'age': 25}),
                             content_type='application/json')
        
        assert response.status_code == 401

def run_integration_tests():
    """Run comprehensive integration tests"""
    print("🧪 Running SmartEats Integration Tests...")
    print("=" * 50)
    
    # Create test client
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            
            print("✅ Database created successfully")
            
            # Test user registration and authentication
            user_data = {
                'name': 'Integration Test User',
                'email': 'integration@test.com',
                'password': 'testpass123'
            }
            
            response = client.post('/api/auth/register', 
                                 data=json.dumps(user_data),
                                 content_type='application/json')
            
            assert response.status_code == 201
            print("✅ User registration test passed")
            
            # Test nutrition calculation
            auth_token = json.loads(response.data)['access_token']
            headers = {'Authorization': f'Bearer {auth_token}'}
            
            nutrition_data = {
                'age': 30,
                'gender': 'male',
                'height': 175,
                'weight': 70,
                'activity': 'moderate'
            }
            
            response = client.post('/api/nutrition/calculate', 
                                 data=json.dumps(nutrition_data),
                                 content_type='application/json',
                                 headers=headers)
            
            assert response.status_code == 200
            print("✅ Nutrition calculation test passed")
            
            # Test AI chat
            chat_data = {'message': 'How much protein do I need?'}
            response = client.post('/api/chat', 
                                 data=json.dumps(chat_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            print("✅ AI chat test passed")
            
            # Test meal logging
            meal_data = {
                'meal_name': 'Test Meal',
                'calories': 300,
                'protein': 20,
                'meal_type': 'lunch'
            }
            
            response = client.post('/api/meals/log', 
                                 data=json.dumps(meal_data),
                                 content_type='application/json',
                                 headers=headers)
            
            assert response.status_code == 200
            print("✅ Meal logging test passed")
            
            print("=" * 50)
            print("🎉 All integration tests passed successfully!")
            print("🍎 SmartEats is ready for production!")

if __name__ == '__main__':
    # Run integration tests if script is executed directly
    run_integration_tests()
