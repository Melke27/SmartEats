"""
🚀 SmartEats Production-Ready Backend System
Enterprise-level Flask API with Advanced Features

Features:
- Advanced caching with Redis
- Real-time data processing
- Enhanced security measures
- API rate limiting
- Database connection pooling
- Comprehensive logging
- Health monitoring
- AI model integration
- Scalable architecture
"""

import os
import sys
import logging
import time
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, List, Optional, Any

# Core Flask imports
from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix

# Database and caching
import redis
import psycopg2
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker

# Monitoring and logging
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge
import structlog

# AI and ML imports
import numpy as np
import pandas as pd
from smart_ai_brain import SmartEatsAISystem, UserProfile

# Configuration
class ProductionConfig:
    """Production configuration class"""
    
    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(32))
    DEBUG = False
    TESTING = False
    
    # Database config
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'postgresql://smarteats:password@localhost:5432/smarteats_prod'
    )
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0,
        'poolclass': pool.QueuePool
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT config
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Redis config
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = REDIS_URL
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = REDIS_URL
    RATELIMIT_DEFAULT = "1000 per hour"
    RATELIMIT_STRATEGY = "fixed-window"
    
    # Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # AI Models
    AI_MODEL_PATH = os.environ.get('AI_MODEL_PATH', './models/')
    AI_BATCH_SIZE = int(os.environ.get('AI_BATCH_SIZE', '32'))
    AI_PREDICTION_CACHE_TTL = int(os.environ.get('AI_CACHE_TTL', '3600'))

# Initialize Flask app with production configuration
def create_production_app():
    """Create Flask app with production configuration"""
    
    app = Flask(__name__)
    app.config.from_object(ProductionConfig)
    
    # Apply proxy fix for deployment behind reverse proxy
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
    
    return app

app = create_production_app()

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
cache = Cache(app)

# CORS configuration for production
CORS(app, 
     origins=[
         "https://smarteats.app",
         "https://www.smarteats.app", 
         "https://admin.smarteats.app"
     ],
     supports_credentials=True
)

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["1000 per hour", "100 per minute"]
)

# Initialize Redis connection
try:
    redis_client = redis.from_url(app.config['REDIS_URL'])
    redis_client.ping()
    print("✅ Redis connection established")
except Exception as e:
    print(f"❌ Redis connection failed: {e}")
    redis_client = None

# Initialize AI System
try:
    ai_system = SmartEatsAISystem()
    print("🧠 AI System initialized successfully")
except Exception as e:
    print(f"⚠️ AI System initialization warning: {e}")
    ai_system = None

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = structlog.get_logger()

# Prometheus metrics
REQUEST_COUNT = Counter('smarteats_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('smarteats_request_duration_seconds', 'Request latency')
ACTIVE_USERS = Gauge('smarteats_active_users', 'Number of active users')
AI_PREDICTIONS = Counter('smarteats_ai_predictions_total', 'AI predictions made', ['type'])

# ===== ENHANCED DATABASE MODELS =====

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Enhanced user fields
    is_active = db.Column(db.Boolean, default=True)
    is_premium = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI and personalization
    ai_personalization_score = db.Column(db.Float, default=0.5)
    cultural_preference = db.Column(db.String(50))
    privacy_settings = db.Column(db.Text)  # JSON
    
    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    meals = db.relationship('MealLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    achievements = db.relationship('UserAchievement', backref='user', cascade='all, delete-orphan')
    ai_sessions = db.relationship('AILearningSession', backref='user', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_premium': self.is_premium,
            'created_at': self.created_at.isoformat(),
            'ai_personalization_score': self.ai_personalization_score
        }

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Basic profile
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    height = db.Column(db.Float)  # cm
    weight = db.Column(db.Float)  # kg
    activity_level = db.Column(db.String(20))
    
    # Enhanced profile
    timezone = db.Column(db.String(50))
    country = db.Column(db.String(50))
    language = db.Column(db.String(10), default='en')
    dietary_restrictions = db.Column(db.Text)  # JSON array
    health_conditions = db.Column(db.Text)  # JSON array
    health_goals = db.Column(db.Text)  # JSON array
    cultural_background = db.Column(db.String(50))
    
    # Tracking
    nutrition_compliance_score = db.Column(db.Float, default=0.5)
    sustainability_score = db.Column(db.Float, default=0.5)
    engagement_level = db.Column(db.String(20), default='medium')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AILearningSession(db.Model):
    __tablename__ = 'ai_learning_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_type = db.Column(db.String(50), nullable=False)  # chat, recommendation, prediction
    input_data = db.Column(db.Text)  # JSON
    ai_response = db.Column(db.Text)  # JSON
    user_feedback = db.Column(db.Text)  # JSON
    satisfaction_score = db.Column(db.Float)
    outcome_quality = db.Column(db.Float)
    model_version = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class SystemMetrics(db.Model):
    __tablename__ = 'system_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    metric_type = db.Column(db.String(50))  # counter, gauge, histogram
    tags = db.Column(db.Text)  # JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

# ===== MIDDLEWARE AND DECORATORS =====

def require_api_key(f):
    """Decorator to require API key for sensitive endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not verify_api_key(api_key):
            return jsonify({'error': 'Invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def monitor_performance(f):
    """Decorator to monitor endpoint performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = f(*args, **kwargs)
            REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint).inc()
            return result
        finally:
            REQUEST_LATENCY.observe(time.time() - start_time)
            
    return decorated_function

def cache_response(timeout=300):
    """Decorator to cache API responses"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not cache:
                return f(*args, **kwargs)
                
            # Create cache key
            cache_key = f"{request.endpoint}:{hash(str(request.get_json()) + str(request.args))}"
            
            # Try to get cached response
            cached = cache.get(cache_key)
            if cached:
                return cached
                
            # Generate response and cache it
            result = f(*args, **kwargs)
            cache.set(cache_key, result, timeout=timeout)
            return result
            
        return decorated_function
    return decorator

# ===== ENHANCED API ROUTES =====

@app.before_request
def before_request():
    """Execute before each request"""
    g.start_time = time.time()
    g.user_id = None
    
    # Log request
    logger.info(
        "request_started",
        method=request.method,
        path=request.path,
        remote_addr=request.remote_addr
    )

@app.after_request
def after_request(response):
    """Execute after each request"""
    
    # Log response
    duration = time.time() - g.start_time
    logger.info(
        "request_completed",
        method=request.method,
        path=request.path,
        status_code=response.status_code,
        duration=duration
    )
    
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response

@app.route('/api/v2/health', methods=['GET'])
@monitor_performance
def health_check():
    """Enhanced health check endpoint"""
    
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '2.0.0',
        'environment': os.environ.get('ENVIRONMENT', 'production'),
        'services': {
            'database': check_database_health(),
            'redis': check_redis_health(),
            'ai_models': check_ai_models_health()
        },
        'metrics': {
            'active_users': get_active_users_count(),
            'total_users': User.query.count(),
            'api_requests_last_hour': get_api_requests_count(),
            'avg_response_time': get_avg_response_time()
        }
    }
    
    # Determine overall health
    service_health = all(service['status'] == 'healthy' for service in health_status['services'].values())
    health_status['status'] = 'healthy' if service_health else 'degraded'
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return jsonify(health_status), status_code

@app.route('/api/v2/ai/enhanced-chat', methods=['POST'])
@jwt_required()
@limiter.limit("60 per minute")
@monitor_performance
@cache_response(timeout=60)
def enhanced_ai_chat():
    """Advanced AI chat with real-time learning"""
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate input
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
            
        message = data['message']
        context = data.get('context', {})
        
        # Get comprehensive user data
        user_data = get_enhanced_user_profile(user_id)
        if not user_data:
            return jsonify({'error': 'User profile not found'}), 404
            
        # Create user profile for AI
        user_profile = UserProfile(
            user_id=user_id,
            age=user_data.get('age', 25),
            gender=user_data.get('gender', 'other'),
            weight=user_data.get('weight', 70.0),
            height=user_data.get('height', 170.0),
            activity_level=user_data.get('activity_level', 'moderate'),
            dietary_restrictions=user_data.get('dietary_restrictions', []),
            health_goals=user_data.get('health_goals', []),
            cultural_background=user_data.get('cultural_background', 'mixed'),
            meal_history=get_recent_meals(user_id),
            nutrition_compliance=user_data.get('nutrition_compliance_score', 0.5),
            sustainability_score=user_data.get('sustainability_score', 0.5)
        )
        
        # Generate AI response
        if ai_system:
            recommendations = ai_system.nutrition_ai.generate_personalized_recommendations(user_profile)
            
            # Log AI interaction
            ai_session = AILearningSession(
                user_id=user_id,
                session_type='chat',
                input_data=json.dumps({'message': message, 'context': context}),
                ai_response=json.dumps(recommendations),
                model_version='2.0.0'
            )
            db.session.add(ai_session)
            db.session.commit()
            
            AI_PREDICTIONS.labels(type='nutrition_recommendation').inc()
            
            return jsonify({
                'success': True,
                'response': recommendations,
                'session_id': ai_session.id,
                'ai_confidence': recommendations.get('confidence_score', 0.8),
                'personalization_score': user_data.get('ai_personalization_score', 0.5)
            })
        else:
            # Fallback to basic AI
            return jsonify({
                'success': True,
                'response': {
                    'message': 'AI system is being updated. Using basic recommendations.',
                    'recommendations': generate_basic_recommendations(user_profile)
                },
                'fallback_mode': True
            })
            
    except Exception as e:
        logger.error("ai_chat_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'AI chat service temporarily unavailable'}), 503

@app.route('/api/v2/ai/predict-health', methods=['POST'])
@jwt_required()
@limiter.limit("20 per minute")
@monitor_performance
@cache_response(timeout=1800)  # 30 minutes cache
def predict_health_outcomes():
    """Advanced health outcome predictions"""
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        timeframe = data.get('timeframe', 30)
        
        # Validate timeframe
        if timeframe < 1 or timeframe > 365:
            return jsonify({'error': 'Timeframe must be between 1 and 365 days'}), 400
            
        # Get user data
        user_data = get_enhanced_user_profile(user_id)
        if not user_data:
            return jsonify({'error': 'User profile not found'}), 404
            
        # Create user profile
        user_profile = create_user_profile_from_data(user_id, user_data)
        
        # Generate predictions
        if ai_system:
            predictions = ai_system.predictive_analytics.predict_30_day_health_trajectory(user_profile)
            
            AI_PREDICTIONS.labels(type='health_prediction').inc()
            
            return jsonify({
                'success': True,
                'predictions': predictions,
                'timeframe_days': timeframe,
                'confidence_interval': 0.85,
                'generated_at': datetime.utcnow().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Prediction service temporarily unavailable'
            }), 503
            
    except Exception as e:
        logger.error("health_prediction_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Health prediction service error'}), 500

@app.route('/api/v2/ai/cultural-foods', methods=['GET'])
@jwt_required()
@limiter.limit("100 per minute")
@monitor_performance
@cache_response(timeout=3600)  # 1 hour cache
def get_cultural_food_recommendations():
    """AI-powered cultural food recommendations"""
    
    try:
        user_id = get_jwt_identity()
        region = request.args.get('region', 'all')
        limit = min(int(request.args.get('limit', 10)), 50)
        
        # Get user data
        user_data = get_enhanced_user_profile(user_id)
        if not user_data:
            return jsonify({'error': 'User profile not found'}), 404
            
        # Create user profile
        user_profile = create_user_profile_from_data(user_id, user_data)
        
        # Get cultural food recommendations
        if ai_system:
            recommendations = ai_system.cultural_intelligence.recommend_cultural_foods(
                user_profile, n_recommendations=limit
            )
            
            AI_PREDICTIONS.labels(type='cultural_recommendation').inc()
            
            return jsonify({
                'success': True,
                'recommendations': recommendations,
                'region_filter': region,
                'total_recommendations': len(recommendations),
                'personalization_score': user_data.get('ai_personalization_score', 0.5)
            })
        else:
            # Fallback to static recommendations
            return jsonify({
                'success': True,
                'recommendations': get_static_cultural_foods(region, limit),
                'fallback_mode': True
            })
            
    except Exception as e:
        logger.error("cultural_foods_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Cultural foods service error'}), 500

@app.route('/api/v2/ai/feedback', methods=['POST'])
@jwt_required()
@limiter.limit("100 per minute")
@monitor_performance
def submit_ai_feedback():
    """Submit feedback for AI learning"""
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate feedback data
        required_fields = ['session_id', 'satisfaction_score']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required feedback fields'}), 400
            
        session_id = data['session_id']
        satisfaction_score = data['satisfaction_score']
        
        # Validate satisfaction score
        if not 0 <= satisfaction_score <= 1:
            return jsonify({'error': 'Satisfaction score must be between 0 and 1'}), 400
            
        # Update AI learning session
        ai_session = AILearningSession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not ai_session:
            return jsonify({'error': 'AI session not found'}), 404
            
        ai_session.user_feedback = json.dumps(data)
        ai_session.satisfaction_score = satisfaction_score
        ai_session.outcome_quality = data.get('outcome_quality', satisfaction_score)
        
        db.session.commit()
        
        # Submit to AI learning engine
        if ai_system:
            ai_system.learning_engine.add_learning_sample(user_id, {
                'type': ai_session.session_type,
                'input': json.loads(ai_session.input_data),
                'response': json.loads(ai_session.ai_response),
                'feedback': data,
                'quality_score': satisfaction_score
            })
            
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully',
            'learning_impact': 'AI will improve based on your feedback'
        })
        
    except Exception as e:
        logger.error("ai_feedback_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Feedback submission failed'}), 500

@app.route('/api/v2/analytics/dashboard', methods=['GET'])
@jwt_required()
@limiter.limit("200 per minute")
@monitor_performance
@cache_response(timeout=300)  # 5 minutes cache
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    
    try:
        user_id = get_jwt_identity()
        days = min(int(request.args.get('days', 30)), 365)
        
        # Get analytics data
        analytics = {
            'nutrition_trends': get_nutrition_trends(user_id, days),
            'goal_progress': get_goal_progress(user_id),
            'achievement_stats': get_achievement_stats(user_id),
            'health_metrics': get_health_metrics(user_id, days),
            'sustainability_score': get_sustainability_metrics(user_id, days),
            'cultural_exploration': get_cultural_exploration_stats(user_id),
            'ai_insights': get_ai_insights_summary(user_id),
            'sdg_impact': get_user_sdg_impact(user_id)
        }
        
        return jsonify({
            'success': True,
            'analytics': analytics,
            'timeframe_days': days,
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error("dashboard_analytics_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Analytics service error'}), 500

@app.route('/api/v2/nutrition/advanced-calculate', methods=['POST'])
@jwt_required()
@limiter.limit("100 per minute")
@monitor_performance
def advanced_nutrition_calculate():
    """Advanced nutrition calculation with AI insights"""
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['weight', 'height', 'age', 'gender', 'activity']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Enhanced BMR calculation
        bmr = calculate_enhanced_bmr(data)
        tdee = calculate_enhanced_tdee(bmr, data['activity'], data.get('goals', []))
        
        # Calculate advanced macros with AI optimization
        macros = calculate_ai_optimized_macros(tdee, data)
        
        # Get AI recommendations
        ai_recommendations = None
        if ai_system:
            user_profile = create_user_profile_from_data(user_id, data)
            ai_recommendations = ai_system.nutrition_ai.generate_personalized_recommendations(user_profile)
            
        # Save to database with enhanced tracking
        save_enhanced_nutrition_plan(user_id, {
            'bmr': bmr,
            'tdee': tdee,
            'macros': macros,
            'ai_recommendations': ai_recommendations,
            'calculation_context': data
        })
        
        return jsonify({
            'success': True,
            'results': {
                'bmr': round(bmr),
                'tdee': round(tdee),
                'bmi': calculate_bmi(data['weight'], data['height']),
                'macros': macros,
                'ai_insights': ai_recommendations,
                'sustainability_suggestions': get_sustainability_suggestions(macros),
                'cultural_alternatives': get_cultural_macro_alternatives(macros, data.get('cultural_preference'))
            },
            'calculation_method': 'ai_enhanced',
            'confidence_score': 0.92
        })
        
    except Exception as e:
        logger.error("advanced_nutrition_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Nutrition calculation failed'}), 500

@app.route('/api/v2/meals/smart-log', methods=['POST'])
@jwt_required()
@limiter.limit("200 per minute")
@monitor_performance
def smart_meal_logging():
    """Enhanced meal logging with AI analysis"""
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate meal data
        if not data.get('meal_name'):
            return jsonify({'error': 'Meal name is required'}), 400
            
        # Enhanced nutrition lookup with AI
        nutrition_data = get_enhanced_nutrition_data(data['meal_name'], data.get('portion_size', 100))
        
        # Create meal log with enhanced data
        meal = MealLog(
            user_id=user_id,
            meal_name=data['meal_name'],
            calories=nutrition_data.get('calories', data.get('calories', 0)),
            protein=nutrition_data.get('protein', data.get('protein', 0)),
            carbs=nutrition_data.get('carbs', data.get('carbs', 0)),
            fat=nutrition_data.get('fat', data.get('fat', 0)),
            fiber=nutrition_data.get('fiber', 0),
            meal_type=data.get('meal_type', 'snack'),
            portion_size=data.get('portion_size', 100),
            confidence_score=nutrition_data.get('confidence', 0.8),
            source=nutrition_data.get('source', 'user_input')
        )
        
        db.session.add(meal)
        db.session.commit()
        
        # AI analysis of meal
        meal_analysis = None
        if ai_system:
            meal_analysis = analyze_meal_with_ai(user_id, meal, nutrition_data)
            
        # Check achievements
        new_achievements = check_enhanced_achievements(user_id)
        
        # Update user metrics
        update_user_nutrition_metrics(user_id)
        
        return jsonify({
            'success': True,
            'meal': {
                'id': meal.id,
                'nutrition': nutrition_data,
                'ai_analysis': meal_analysis,
                'achievements_earned': new_achievements
            },
            'daily_summary': get_daily_nutrition_summary(user_id),
            'recommendations': meal_analysis.get('recommendations', []) if meal_analysis else []
        })
        
    except Exception as e:
        logger.error("smart_meal_log_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Meal logging failed'}), 500

@app.route('/api/v2/goals/intelligent-tracking', methods=['GET'])
@jwt_required()
@limiter.limit("100 per minute") 
@monitor_performance
@cache_response(timeout=600)  # 10 minutes cache
def intelligent_goal_tracking():
    """AI-powered goal tracking and predictions"""
    
    try:
        user_id = get_jwt_identity()
        
        # Get user goals
        user_goals = get_user_goals(user_id)
        if not user_goals:
            return jsonify({'error': 'No goals found'}), 404
            
        # Get comprehensive user data
        user_data = get_enhanced_user_profile(user_id)
        user_profile = create_user_profile_from_data(user_id, user_data)
        
        # AI goal analysis
        goal_analytics = None
        if ai_system:
            goal_analytics = ai_system.nutrition_ai.predict_goal_achievement(user_profile, user_goals)
            AI_PREDICTIONS.labels(type='goal_prediction').inc()
            
        # Enhanced goal tracking
        enhanced_tracking = {
            'current_goals': user_goals,
            'ai_predictions': goal_analytics,
            'progress_analysis': analyze_goal_progress(user_id, user_goals),
            'optimization_suggestions': generate_goal_optimizations(user_id, user_goals),
            'adaptive_adjustments': suggest_adaptive_adjustments(user_id, goal_analytics),
            'milestone_tracking': get_milestone_progress(user_id),
            'streak_analysis': calculate_goal_streaks(user_id)
        }
        
        return jsonify({
            'success': True,
            'goal_tracking': enhanced_tracking,
            'ai_confidence': goal_analytics.get('confidence', 0.8) if goal_analytics else 0.6,
            'next_update': (datetime.utcnow() + timedelta(hours=6)).isoformat()
        })
        
    except Exception as e:
        logger.error("intelligent_goal_tracking_error", error=str(e), user_id=user_id)
        return jsonify({'error': 'Goal tracking service error'}), 500

@app.route('/api/v2/community/enhanced-leaderboard', methods=['GET'])
@limiter.limit("50 per minute")
@monitor_performance
@cache_response(timeout=900)  # 15 minutes cache
def get_enhanced_leaderboard():
    """Enhanced community leaderboard with AI insights"""
    
    try:
        limit = min(int(request.args.get('limit', 20)), 100)
        timeframe = request.args.get('timeframe', 'week')  # week, month, all-time
        category = request.args.get('category', 'overall')  # overall, nutrition, sustainability, cultural
        
        # Get leaderboard data
        leaderboard_data = get_leaderboard_data(timeframe, category, limit)
        
        # Add AI insights to leaderboard
        enhanced_leaderboard = []
        for user_entry in leaderboard_data:
            
            # Add AI-generated insights
            ai_insights = generate_leaderboard_insights(user_entry, category)
            
            enhanced_entry = {
                **user_entry,
                'ai_insights': ai_insights,
                'trending': calculate_trending_score(user_entry),
                'specializations': identify_user_specializations(user_entry['user_id']),
                'impact_metrics': get_user_impact_metrics(user_entry['user_id'])
            }
            
            enhanced_leaderboard.append(enhanced_entry)
            
        return jsonify({
            'success': True,
            'leaderboard': enhanced_leaderboard,
            'metadata': {
                'timeframe': timeframe,
                'category': category,
                'total_participants': get_total_participants(timeframe, category),
                'global_stats': get_global_community_stats()
            },
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error("enhanced_leaderboard_error", error=str(e))
        return jsonify({'error': 'Leaderboard service error'}), 500

# ===== UTILITY FUNCTIONS =====

def check_database_health() -> Dict:
    """Check database connectivity and performance"""
    try:
        start_time = time.time()
        db.session.execute('SELECT 1')
        query_time = time.time() - start_time
        
        return {
            'status': 'healthy',
            'response_time_ms': round(query_time * 1000, 2),
            'connection_pool': {
                'active': db.engine.pool.checked_in(),
                'total': db.engine.pool.size()
            }
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def check_redis_health() -> Dict:
    """Check Redis connectivity and performance"""
    try:
        if redis_client:
            start_time = time.time()
            redis_client.ping()
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy',
                'response_time_ms': round(response_time * 1000, 2),
                'memory_usage': redis_client.info('memory')['used_memory_human']
            }
        else:
            return {'status': 'unavailable'}
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def check_ai_models_health() -> Dict:
    """Check AI models status"""
    try:
        if ai_system:
            # Test basic AI functionality
            test_user = UserProfile(
                user_id=0, age=25, gender='other', weight=70, height=170,
                activity_level='moderate', dietary_restrictions=[], health_goals=[],
                cultural_background='mixed', meal_history=[], 
                nutrition_compliance=0.5, sustainability_score=0.5
            )
            
            # Test recommendation generation
            start_time = time.time()
            test_recommendations = ai_system.nutrition_ai.generate_personalized_recommendations(test_user)
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy',
                'response_time_ms': round(response_time * 1000, 2),
                'models_loaded': len(ai_system.ai_brain.models),
                'last_training': 'N/A'  # Would track actual training times
            }
        else:
            return {'status': 'fallback_mode'}
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def get_enhanced_user_profile(user_id: int) -> Optional[Dict]:
    """Get comprehensive user profile for AI processing"""
    
    try:
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return None
            
        profile = user.profile
        if not profile:
            return None
            
        return {
            'user_id': user_id,
            'age': profile.age,
            'gender': profile.gender,
            'weight': profile.weight,
            'height': profile.height,
            'activity_level': profile.activity_level,
            'dietary_restrictions': json.loads(profile.dietary_restrictions or '[]'),
            'health_goals': json.loads(profile.health_goals or '[]'),
            'cultural_background': profile.cultural_background,
            'nutrition_compliance_score': profile.nutrition_compliance_score,
            'sustainability_score': profile.sustainability_score,
            'ai_personalization_score': user.ai_personalization_score,
            'engagement_level': profile.engagement_level,
            'timezone': profile.timezone,
            'country': profile.country,
            'language': profile.language
        }
        
    except Exception as e:
        logger.error("get_user_profile_error", error=str(e), user_id=user_id)
        return None

def create_user_profile_from_data(user_id: int, user_data: Dict) -> UserProfile:
    """Create UserProfile object from user data"""
    
    return UserProfile(
        user_id=user_id,
        age=user_data.get('age', 25),
        gender=user_data.get('gender', 'other'),
        weight=user_data.get('weight', 70.0),
        height=user_data.get('height', 170.0),
        activity_level=user_data.get('activity_level', 'moderate'),
        dietary_restrictions=user_data.get('dietary_restrictions', []),
        health_goals=user_data.get('health_goals', []),
        cultural_background=user_data.get('cultural_background', 'mixed'),
        meal_history=get_recent_meals(user_id),
        nutrition_compliance=user_data.get('nutrition_compliance_score', 0.5),
        sustainability_score=user_data.get('sustainability_score', 0.5)
    )

def get_recent_meals(user_id: int, days: int = 7) -> List[Dict]:
    """Get recent meals for AI analysis"""
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        meals = MealLog.query.filter(
            MealLog.user_id == user_id,
            MealLog.logged_at >= cutoff_date
        ).order_by(MealLog.logged_at.desc()).limit(50).all()
        
        return [{
            'name': meal.meal_name,
            'calories': meal.calories,
            'protein': meal.protein,
            'carbs': meal.carbs,
            'fat': meal.fat,
            'type': meal.meal_type,
            'timestamp': meal.logged_at.isoformat()
        } for meal in meals]
        
    except Exception as e:
        logger.error("get_recent_meals_error", error=str(e), user_id=user_id)
        return []

# ===== ENHANCED METRICS AND MONITORING =====

@app.route('/metrics')
@require_api_key
def metrics():
    """Prometheus metrics endpoint"""
    return prometheus_client.generate_latest()

@app.route('/api/v2/admin/system-stats', methods=['GET'])
@require_api_key
@monitor_performance
def get_system_stats():
    """Get comprehensive system statistics"""
    
    try:
        stats = {
            'users': {
                'total': User.query.count(),
                'active_24h': get_active_users_count(24),
                'active_7d': get_active_users_count(168),
                'premium': User.query.filter_by(is_premium=True).count()
            },
            'engagement': {
                'meals_logged_24h': get_meals_logged_count(24),
                'ai_interactions_24h': get_ai_interactions_count(24),
                'goals_achieved_7d': get_goals_achieved_count(168)
            },
            'ai_performance': {
                'predictions_made_24h': get_ai_predictions_count(24),
                'average_confidence': get_average_ai_confidence(),
                'user_satisfaction': get_average_ai_satisfaction(),
                'model_accuracy': get_model_accuracy_metrics()
            },
            'sdg_impact': {
                'total_users_helped': get_total_users_helped(),
                'nutrition_improvements': get_nutrition_improvements_count(),
                'sustainability_actions': get_sustainability_actions_count(),
                'cultural_foods_adopted': get_cultural_foods_adoption_count()
            }
        }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error("system_stats_error", error=str(e))
        return jsonify({'error': 'System stats unavailable'}), 500

# ===== ERROR HANDLERS =====

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit errors"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.',
        'retry_after': str(e.retry_after)
    }), 429

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error("internal_server_error", error=str(error))
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found'
    }), 404

# ===== SECURITY FUNCTIONS =====

def verify_api_key(api_key: str) -> bool:
    """Verify API key for admin endpoints"""
    expected_key = os.environ.get('ADMIN_API_KEY')
    if not expected_key:
        return False
    return secrets.compare_digest(api_key, expected_key)

def rate_limit_key():
    """Generate rate limit key"""
    if jwt_required():
        return get_jwt_identity()
    return get_remote_address()

# ===== STARTUP AND INITIALIZATION =====

def initialize_production_app():
    """Initialize application for production"""
    
    print("🚀 Initializing SmartEats Production Backend...")
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("📊 Database tables created/verified")
        
    # Initialize sample data for new deployment
    initialize_production_data()
    
    # Warm up AI models
    if ai_system:
        warm_up_ai_models()
        
    # Set up monitoring
    setup_monitoring()
    
    print("✅ SmartEats Production Backend Ready!")
    print("🌍 Supporting SDG 2 (Zero Hunger) & SDG 3 (Good Health)")
    print("🧠 Advanced AI system active")
    print("📈 Real-time analytics enabled")

def initialize_production_data():
    """Initialize production data and configurations"""
    
    try:
        # Create default achievements if they don't exist
        default_achievements = [
            {
                'name': 'First Steps',
                'description': 'Complete your first nutrition calculation',
                'badge_emoji': '🚀',
                'points': 10,
                'category': 'onboarding'
            },
            {
                'name': 'Cultural Explorer',
                'description': 'Try your first cultural food recommendation',
                'badge_emoji': '🌍',
                'points': 25,
                'category': 'cultural'
            },
            {
                'name': 'AI Collaborator',
                'description': 'Have 10 AI chat interactions',
                'badge_emoji': '🤖',
                'points': 50,
                'category': 'ai'
            },
            {
                'name': 'SDG Champion',
                'description': 'Make significant contribution to SDG goals',
                'badge_emoji': '🏆',
                'points': 100,
                'category': 'sdg'
            }
        ]
        
        for achievement_data in default_achievements:
            existing = Achievement.query.filter_by(name=achievement_data['name']).first()
            if not existing:
                achievement = Achievement(**achievement_data)
                db.session.add(achievement)
                
        db.session.commit()
        print("🏆 Default achievements initialized")
        
    except Exception as e:
        logger.error("production_data_init_error", error=str(e))

def warm_up_ai_models():
    """Warm up AI models for faster responses"""
    
    try:
        if ai_system:
            # Create test user profile
            test_profile = UserProfile(
                user_id=0, age=25, gender='other', weight=70, height=170,
                activity_level='moderate', dietary_restrictions=[], health_goals=[],
                cultural_background='mixed', meal_history=[], 
                nutrition_compliance=0.5, sustainability_score=0.5
            )
            
            # Warm up models
            ai_system.nutrition_ai.generate_personalized_recommendations(test_profile)
            ai_system.cultural_intelligence.recommend_cultural_foods(test_profile, 5)
            
            print("🧠 AI models warmed up successfully")
            
    except Exception as e:
        logger.error("ai_warmup_error", error=str(e))

def setup_monitoring():
    """Setup monitoring and alerting"""
    
    # Update active users gauge
    ACTIVE_USERS.set(get_active_users_count(24))
    
    print("📊 Monitoring and metrics initialized")

# ===== PRODUCTION DEPLOYMENT =====

if __name__ == '__main__':
    # Initialize for production
    initialize_production_app()
    
    # Production WSGI server configuration
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"🌐 SmartEats Production API Server")
    print(f"🔗 Running on http://{host}:{port}")
    print(f"📊 Health check: http://{host}:{port}/api/v2/health")
    print(f"📈 Metrics: http://{host}:{port}/metrics")
    
    # Run with production settings
    app.run(
        host=host,
        port=port,
        debug=False,
        threaded=True
    )

# Additional production considerations:
"""
For production deployment, consider using:

1. WSGI Server: Gunicorn or uWSGI
   gunicorn -w 4 -b 0.0.0.0:5000 production_backend:app

2. Reverse Proxy: Nginx
   Configure Nginx for SSL termination and load balancing

3. Process Manager: Supervisor or systemd
   Ensure automatic restart and monitoring

4. Database: PostgreSQL with connection pooling
   Use PgBouncer for connection pooling

5. Caching: Redis with persistence
   Configure Redis for high availability

6. Monitoring: Prometheus + Grafana
   Set up comprehensive monitoring dashboards

7. Logging: ELK Stack or similar
   Centralized logging for debugging and analytics

8. Security: 
   - Enable HTTPS everywhere
   - Use environment variables for secrets
   - Implement proper CORS policies
   - Add request validation and sanitization

9. Scalability:
   - Horizontal scaling with load balancers
   - Database read replicas
   - CDN for static assets
   - Container orchestration (Kubernetes)

10. Backup and Recovery:
    - Automated database backups
    - Disaster recovery procedures
    - Data retention policies
"""
