"""
🚀 SmartEats Production-Ready Backend System (Fixed Version)
Enterprise-level Flask API with Graceful Dependency Handling

Features:
- Graceful fallbacks for missing dependencies
- Core functionality maintained
- Enhanced error handling
- Production-ready configuration
"""

import os
import sys
import logging
import time
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, List, Optional, Any

# Core Flask imports (always available)
from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

# Optional imports with graceful fallbacks
redis_client = None
limiter = None
cache = None
ai_system = None
migrate = None

# Try to import optional dependencies
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    HAS_LIMITER = True
except ImportError:
    HAS_LIMITER = False
    print("⚠️ Flask-Limiter not available - rate limiting disabled")

try:
    from flask_caching import Cache
    HAS_CACHING = True
except ImportError:
    HAS_CACHING = False
    print("⚠️ Flask-Caching not available - caching disabled")

try:
    from flask_migrate import Migrate
    HAS_MIGRATE = True
except ImportError:
    HAS_MIGRATE = False
    print("⚠️ Flask-Migrate not available - migrations disabled")

try:
    import redis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False
    print("⚠️ Redis not available - using in-memory storage")

try:
    import prometheus_client
    from prometheus_client import Counter, Histogram, Gauge
    HAS_PROMETHEUS = True
except ImportError:
    HAS_PROMETHEUS = False
    print("⚠️ Prometheus client not available - metrics disabled")

try:
    import structlog
    HAS_STRUCTLOG = True
except ImportError:
    HAS_STRUCTLOG = False
    print("⚠️ Structlog not available - using basic logging")

try:
    import numpy as np
    import pandas as pd
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False
    print("⚠️ NumPy/Pandas not available - ML features disabled")

try:
    from smart_ai_brain import SmartEatsAISystem
    HAS_AI_SYSTEM = True
except ImportError:
    HAS_AI_SYSTEM = False
    print("⚠️ AI System not available - using fallback responses")

# Configuration
class ProductionConfig:
    """Production configuration class with fallbacks"""
    
    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smarteats-fallback-secret-key')
    DEBUG = False
    TESTING = False
    
    # Database config - fallback to SQLite if PostgreSQL not available
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///smarteats_production.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT config
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-fallback')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Redis config (if available)
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # Cache config
    if HAS_CACHING and HAS_REDIS:
        CACHE_TYPE = 'redis'
        CACHE_REDIS_URL = REDIS_URL
    else:
        CACHE_TYPE = 'simple'  # In-memory cache fallback

# Initialize Flask app
def create_production_app():
    """Create Flask app with production configuration"""
    
    app = Flask(__name__)
    app.config.from_object(ProductionConfig)
    
    return app

app = create_production_app()

# Initialize core extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Initialize optional extensions
if HAS_MIGRATE:
    migrate = Migrate(app, db)

if HAS_CACHING:
    cache = Cache(app)

# CORS configuration
CORS(app, 
     origins=["*"],  # Permissive for development, should be restricted in production
     supports_credentials=True
)

# Rate limiting (if available)
if HAS_LIMITER:
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["1000 per hour", "100 per minute"]
    )

# Redis connection (if available)
if HAS_REDIS:
    try:
        redis_client = redis.from_url(app.config['REDIS_URL'])
        redis_client.ping()
        print("✅ Redis connection established")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        redis_client = None

# AI System (if available)
if HAS_AI_SYSTEM:
    try:
        ai_system = SmartEatsAISystem()
        print("🧠 AI System initialized successfully")
    except Exception as e:
        print(f"⚠️ AI System initialization failed: {e}")
        ai_system = None

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if HAS_STRUCTLOG:
    logger = structlog.get_logger()
else:
    logger = logging.getLogger(__name__)

# Prometheus metrics (if available)
if HAS_PROMETHEUS:
    REQUEST_COUNT = Counter('smarteats_requests_total', 'Total requests', ['method', 'endpoint'])
    REQUEST_LATENCY = Histogram('smarteats_request_duration_seconds', 'Request latency')
    ACTIVE_USERS = Gauge('smarteats_active_users', 'Number of active users')

# ===== DATABASE MODELS =====

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # User status fields
    is_active = db.Column(db.Boolean, default=True)
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meals = db.relationship('MealLog', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'is_premium': self.is_premium,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MealLog(db.Model):
    __tablename__ = 'meal_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Float)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fat = db.Column(db.Float)
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'meal_name': self.meal_name,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'meal_type': self.meal_type,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None
        }

# ===== MIDDLEWARE =====

@app.before_request
def before_request():
    """Before request middleware"""
    if HAS_PROMETHEUS:
        g.start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.path}")

@app.after_request
def after_request(response):
    """After request middleware"""
    if HAS_PROMETHEUS and hasattr(g, 'start_time'):
        REQUEST_LATENCY.observe(time.time() - g.start_time)
        REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint or 'unknown').inc()
    
    return response

# ===== API ROUTES =====

@app.route('/api', methods=['GET'])
def api_health():
    """API health check"""
    return jsonify({
        'status': 'healthy',
        'message': 'SmartEats API is running',
        'version': '1.0.0',
        'features': {
            'redis': HAS_REDIS and redis_client is not None,
            'caching': HAS_CACHING,
            'rate_limiting': HAS_LIMITER,
            'metrics': HAS_PROMETHEUS,
            'ai_system': HAS_AI_SYSTEM and ai_system is not None,
            'ml_libs': HAS_ML_LIBS
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            name=data.get('name', 'User')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile'}), 500

@app.route('/api/meals', methods=['GET', 'POST'])
@jwt_required()
def meals():
    """Get or add meals"""
    user_id = get_jwt_identity()
    
    if request.method == 'GET':
        try:
            user_meals = MealLog.query.filter_by(user_id=user_id).order_by(MealLog.logged_at.desc()).limit(50).all()
            return jsonify({
                'meals': [meal.to_dict() for meal in user_meals]
            }), 200
        except Exception as e:
            logger.error(f"Get meals error: {str(e)}")
            return jsonify({'error': 'Failed to fetch meals'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            if not data or not data.get('meal_name'):
                return jsonify({'error': 'Meal name is required'}), 400
            
            meal = MealLog(
                user_id=user_id,
                meal_name=data['meal_name'],
                calories=data.get('calories', 0),
                protein=data.get('protein', 0),
                carbs=data.get('carbs', 0),
                fat=data.get('fat', 0),
                meal_type=data.get('meal_type', 'other')
            )
            
            db.session.add(meal)
            db.session.commit()
            
            return jsonify({
                'message': 'Meal logged successfully',
                'meal': meal.to_dict()
            }), 201
            
        except Exception as e:
            logger.error(f"Add meal error: {str(e)}")
            db.session.rollback()
            return jsonify({'error': 'Failed to log meal'}), 500

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get user statistics"""
    try:
        user_id = get_jwt_identity()
        
        # Get today's meals
        today = datetime.utcnow().date()
        today_meals = MealLog.query.filter(
            MealLog.user_id == user_id,
            db.func.date(MealLog.logged_at) == today
        ).all()
        
        # Calculate totals
        total_calories = sum(meal.calories or 0 for meal in today_meals)
        total_protein = sum(meal.protein or 0 for meal in today_meals)
        total_carbs = sum(meal.carbs or 0 for meal in today_meals)
        total_fat = sum(meal.fat or 0 for meal in today_meals)
        
        return jsonify({
            'today': {
                'calories': total_calories,
                'protein': total_protein,
                'carbs': total_carbs,
                'fat': total_fat,
                'meal_count': len(today_meals)
            },
            'total_meals': MealLog.query.filter_by(user_id=user_id).count()
        }), 200
        
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        return jsonify({'error': 'Failed to fetch stats'}), 500

# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# ===== INITIALIZATION =====

def init_database():
    """Initialize database with tables"""
    try:
        db.create_all()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# Initialize database on startup
with app.app_context():
    init_database()

if __name__ == '__main__':
    print("🚀 Starting SmartEats Production Backend (Fixed Version)")
    print(f"✅ Flask app initialized")
    print(f"✅ Database: {'PostgreSQL' if 'postgresql' in app.config['SQLALCHEMY_DATABASE_URI'] else 'SQLite'}")
    print(f"✅ Redis: {'Available' if redis_client else 'Not available'}")
    print(f"✅ Rate limiting: {'Available' if HAS_LIMITER else 'Not available'}")
    print(f"✅ Caching: {'Available' if HAS_CACHING else 'Not available'}")
    print(f"✅ AI System: {'Available' if ai_system else 'Not available'}")
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
