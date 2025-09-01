# 🍎 SmartEats - AI-Powered Nutrition & Wellness Platform

## 🌍 SDG Alignment - Hackathon 2025

**SmartEats directly addresses two critical UN Sustainable Development Goals:**

### 🎯 SDG 2: Zero Hunger
- **Smart Nutrition Calculator**: Personalized calorie and macro recommendations
- **Meal Planning System**: Optimized recipes for balanced nutrition
- **Food Database Integration**: Access to comprehensive nutritional information
- **Recipe Recommender**: AI-powered meal suggestions based on available ingredients

### 🏥 SDG 3: Good Health and Well-Being
- **Health Metrics Tracking**: BMI, BMR, and TDEE calculations
- **Progress Monitoring**: Weight and nutrition goal tracking
- **Hydration Management**: Daily water intake monitoring
- **AI Health Assistant**: Personalized wellness guidance and support

## 🚀 Project Overview
SmartEats is a beginner-friendly, full-stack nutrition and wellness platform built specifically for **Hackathon 2025**. Using simple HTML5 + CSS3 + JavaScript frontend with Python Flask backend, it demonstrates how technology can address global challenges through the UN Sustainable Development Goals.

## ✨ Features

### 🎯 Core Functionality
- **Personalized Nutrition Calculator** - BMI, BMR, TDEE, macronutrients based on user profile
- **Smart Recipe Recommender** - AI-powered meal suggestions from available ingredients
- **AI Nutrition Assistant** - Powered by Hugging Face and OpenAI models
- **Progress Dashboard** - Visual tracking with Chart.js analytics
- **Food Nutrition Lookup** - Real-time nutrition data via multiple APIs

### 🚀 Advanced Features (NEW!)
- **🧘 Wellness & Lifestyle Tracking** - Sleep, stress, mood monitoring with personalized recommendations
- **🎤 Multi-Language Voice Assistant** - Voice commands in English, አማርኛ (Amharic), Kiswahili, Français
- **🤝 Community & Gamification** - Leaderboards, weekly challenges, achievement badges
- **🌱 Sustainability Tracker** - Carbon footprint and water usage analysis for meals
- **🛒 Smart Grocery Lists** - AI-generated eco-friendly shopping lists with cost estimates
- **🙏 Donation Impact Calculator** - Calculate how donations support SDG 2: Zero Hunger
- **📊 Nutritional Deficiency Analysis** - AI-powered health gap identification
- **🌍 Environmental Impact Scoring** - Sustainability metrics for food choices

### 💳 Payment & Monetization
- **Multiple Payment Gateways** - Stripe, PayPal integration for donations
- **Subscription Management** - Tiered access to premium features
- **Donation Tracking** - Direct contribution to fighting hunger (SDG 2)

### 📊 Enhanced Database Features
- **Multi-Database Support** - MySQL, MongoDB, Firebase with automatic switching
- **Advanced Analytics** - Wellness logs, sustainability tracking, community scores
- **User Profiles** - Comprehensive health and preference data
- **Community Data** - Leaderboards, challenges, achievements system

## 🛠️ Technology Stack (Hackathon Compliant)

### Frontend (Simple & Beginner-Friendly)
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern responsive design with animations
- **JavaScript**: Vanilla ES6+ with Chart.js for visualizations
- **No Frameworks**: Pure web technologies as required

### Backend (Python Flask)
- **Flask**: Lightweight Python web framework
- **RESTful APIs**: Clean API endpoints for data operations
- **Multi-Database Support**: MySQL + MongoDB + Firebase
- **AI Integration**: Hugging Face Question-Answering API

### Database Options
- **MySQL**: Relational database for structured data
- **MongoDB**: NoSQL for flexible document storage  
- **Firebase**: Real-time database with cloud hosting

## 📁 File Structure

```
SmartEats/
├── index.html              # Frontend - Main HTML application
├── style.css               # Frontend - CSS styling
├── script.js               # Frontend - JavaScript logic
├── setup.py                # Setup script for easy installation
├── run.py                  # Demo launcher script
├── .env.example            # Environment configuration template
├── database_setup.sql      # MySQL database schema
├── backend/
│   ├── app.py              # Python Flask API server
│   └── requirements.txt    # Python dependencies
└── README.md              # Project documentation
```

## 🚀 Quick Setup (Hackathon Demo)

### Option 1: One-Click Setup
```bash
# 1. Run setup script
python setup.py

# 2. Update .env with your database credentials
# 3. Run the demo
python run.py
```

### Option 2: Manual Setup
```bash
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Setup environment
cp .env.example .env
# Edit .env with your database settings

# 3. Setup database (MySQL example)
mysql -u root -p < database_setup.sql

# 4. Start backend
python backend/app.py

# 5. Open frontend
# Open index.html in your browser
```

## Usage Guide

### Getting Started
1. Open the application in your browser
2. Fill out your personal information (age, gender, height, weight, activity level)
3. Click "Calculate My Nutrition Needs" to get your personalized profile

### Navigation
- **Dashboard**: View your quick stats and nutrition calculator
- **Meals**: Browse meal suggestions and add them to your plan
- **Progress**: View subscription plans and upgrade your account
- **AI Guide**: Chat with the nutrition assistant for personalized advice

### Payment Integration
1. Choose a subscription plan from the Progress tab
2. Select your preferred payment method (Flutterwave or Paystack)
3. Complete the payment process
4. Enjoy premium features

## API Integration

### Flutterwave
- Public Key: Configure in `PAYMENT_CONFIG.flutterwave.publicKey`
- Supports card payments, mobile money, and USSD
- Currency: Nigerian Naira (NGN)

### Paystack
- Public Key: Configure in `PAYMENT_CONFIG.paystack.publicKey`
- Supports card payments and bank transfers
- Currency: Nigerian Naira (NGN)

## Database Schema

### User Profiles
```javascript
{
  id: "profile_timestamp",
  age: number,
  gender: "male|female|other",
  height: number, // cm
  weight: number, // kg
  activityLevel: "sedentary|light|moderate|very|extra",
  calorieGoal: number,
  bmi: number,
  createdAt: ISO_string
}
```

### Meals
```javascript
{
  id: "meal_id",
  name: string,
  description: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  prepTime: number, // minutes
  category: "breakfast|lunch|dinner|snack",
  imageUrl: string
}
```

### Meal Logs
```javascript
{
  id: "log_timestamp",
  mealId: string,
  quantity: number,
  timestamp: ISO_string
}
```

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🏆 Hackathon 2025 Compliance

### ✅ Technical Requirements Met
- **Frontend**: HTML5 + CSS3 + JavaScript (no frameworks) ✅
- **Backend**: Python Flask with RESTful APIs ✅
- **Database**: MySQL + MongoDB + Firebase support ✅
- **AI Integration**: Hugging Face Question-Answering API ✅
- **Responsive Design**: Mobile-first approach ✅

### 🌍 SDG Alignment
- **SDG 2: Zero Hunger** - Recipe recommendations, nutrition planning ✅
- **SDG 3: Good Health** - Health tracking, wellness guidance ✅

### 🚀 Judging Criteria
- **Problem Clarity**: Clear focus on nutrition and health challenges ✅
- **Solution Quality**: Comprehensive nutrition platform ✅
- **Technical Creativity**: Multi-database support + AI integration ✅
- **UI/UX Design**: Professional, intuitive interface ✅
- **Market Insight**: Addresses global health and hunger issues ✅
- **Rapid Prototyping**: Working demo ready for presentation ✅

## 📚 Advanced API Endpoints

### Wellness & Lifestyle APIs
```bash
# Track sleep and stress
POST /api/wellness/sleep-stress
{
  "sleep_hours": 8,
  "stress_level": 5
}

# Process voice commands (multi-language)
POST /api/voice/process
{
  "text": "How much protein do I need?",
  "language": "en"
}
```

### Community & Gamification APIs
```bash
# Get community leaderboard
GET /api/community/leaderboard

# Get weekly challenges
GET /api/challenges/weekly

# Calculate donation impact
POST /api/donation/contribute
{
  "amount": 25,
  "currency": "USD"
}
```

### Sustainability & Environmental APIs
```bash
# Check meal sustainability
POST /api/sustainability/score
{
  "meals": [
    {"name": "Grilled chicken with vegetables"},
    {"name": "Quinoa salad"}
  ]
}

# Generate smart grocery list
POST /api/grocery/generate-list
{
  "meal_plan": [...],
  "days": 7
}
```

### Enhanced Nutrition APIs
```bash
# Advanced AI recipe generator
POST /api/ai/recipe-generator
{
  "ingredients": ["chicken", "vegetables"],
  "mood": "happy",
  "calorie_target": 400
}

# Nutritional deficiency check
POST /api/analytics/deficiency-check
{
  "meals": [...]
}
```

## 🎯 Usage Guide - Advanced Features

### Wellness Tracking
1. Navigate to **Wellness** tab
2. Enter sleep hours and stress level (1-10 scale)
3. Click "Track Wellness" for personalized recommendations
4. Use voice commands in your preferred language

### Community Participation
1. Visit **Community** tab to see leaderboard
2. Participate in weekly challenges (Hydration Hero, Veggie Champion)
3. Earn points and badges for healthy behaviors
4. Calculate donation impact to fight hunger

### Sustainability Tracking
1. Go to **Sustainability** tab
2. List your recent meals to check environmental impact
3. Generate eco-friendly grocery lists
4. View carbon footprint and water usage metrics

## Development Notes

### API Keys Setup
Update `.env` file with your actual API keys:
```bash
# Core APIs
HUGGING_FACE_API_KEY=hf_your_token_here
OPENAI_API_KEY=sk-your_key_here

# Nutrition APIs
NUTRITIONIX_API_KEY=your_nutritionix_key
SPOONACULAR_API_KEY=your_spoonacular_key
EDAMAM_API_KEY=your_edamam_key

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Adding New Meals
Meals can be added programmatically using the database API:
```javascript
db.addMeal({
    name: "New Meal",
    description: "Description here",
    calories: 400,
    protein: 25,
    // ... other properties
});
```

### Extending AI Responses
The AI chatbot responses can be enhanced by modifying the `generateAIResponse()` function in `script.js`.

## Future Enhancements

- Integration with external nutrition APIs
- Real-time meal delivery services
- Social features and community
- Advanced analytics and reporting
- Mobile app development
- Backend API development

## License

This project is developed for the Vibe Coding Hackathon 3.0. All rights reserved.

## Contact

For questions or support regarding this hackathon submission, please contact the development team.

---

**SmartEats** - Your personal nutrition guide powered by AI and scientific formulas. 🍎✨

