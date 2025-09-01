/**
 * SmartEats - Enhanced Frontend JavaScript
 * Hackathon 2025 - SDG 2 & SDG 3 Solution
 * Frontend: HTML5 + CSS3 + JavaScript
 * Backend: Python Flask API
 * Advanced Features: AI, Community, Wellness, Sustainability
 */

// API Configuration - Force Production Backend (Cache Busted)
// Production API URL - NEVER use localhost in production
const API_BASE_URL = 'https://smarteats-1.onrender.com/api';

// Force production environment check
const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Cache buster to force Netlify update - MAJOR VERSION UPDATE
const CACHE_VERSION = 'v2.2-african-foods-production-' + Date.now();

// Log current environment and API configuration
console.log('🌍 SmartEats Environment:', IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('📡 API Base URL:', API_BASE_URL);
console.log('🔄 Cache Version:', CACHE_VERSION);

// Global State Management
const AppState = {
    currentTab: 'dashboard',
    userProfile: null,
    nutritionResults: null,
    progressChart: null,
    meals: [],
    chatHistory: [],
    isAuthenticated: false,
    currentUser: null,
    goals: {},
    progressData: {},
    mealLogs: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupNutritionForm();
    setupAuthentication();
    initializeDashboard();
    loadUserProfile();
    setupChat();
    setupAdvancedFeatures();
    checkAuthStatus();
    
    console.log('🍎 SmartEats App Initialized - Fighting Hunger & Promoting Health!');
}

// Tab Navigation System
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    AppState.currentTab = tabName;
    
    // Load tab-specific data
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'meals':
            loadMealSuggestions();
            break;
        case 'chat':
            // Chat is already initialized
            break;
        case 'wellness':
            // Initialize wellness features if needed
            break;
        case 'community':
            setTimeout(() => {
                loadLeaderboard();
                loadChallenges();
            }, 100);
            break;
        case 'sustainability':
            // Initialize sustainability tracker
            break;
    }
}

// Nutrition Calculator
function setupNutritionForm() {
    const form = document.getElementById('nutritionForm');
    if (form) {
        form.addEventListener('submit', handleNutritionCalculation);
    }
}

async function handleNutritionCalculation(event) {
    event.preventDefault();
    
    const formData = {
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value),
        activity: document.getElementById('activity').value
    };
    
    showLoading('Calculating your personalized nutrition needs...');
    
    try {
        // Check if user is authenticated for backend API call
        const token = getAuthToken();
        if (token) {
            // Use authenticated API call
            const response = await fetch(`${API_BASE_URL}/nutrition/calculate`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const results = await response.json();
                displayNutritionResults(results.results);
                AppState.nutritionResults = results.results;
                AppState.userProfile = formData;
                saveToLocalStorage('userProfile', formData);
                saveToLocalStorage('nutritionResults', results.results);
            } else if (response.status === 401) {
                // Token expired or invalid, clear it and fall back to client-side
                clearAuthToken();
                AppState.isAuthenticated = false;
                showAlert('Session expired. Calculating locally.', 'warning');
                throw new Error('Authentication expired');
            } else {
                throw new Error('Failed to calculate nutrition needs');
            }
        } else {
            // No token, fall back to client-side calculation
            throw new Error('No authentication token');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const results = calculateNutritionClientSide(formData);
        displayNutritionResults(results);
        AppState.nutritionResults = results;
        AppState.userProfile = formData;
        saveToLocalStorage('userProfile', formData);
        saveToLocalStorage('nutritionResults', results);
        
        if (!getAuthToken()) {
            showAlert('💡 Login to save your nutrition data to the cloud!', 'info');
        }
    }
    
    hideLoading();
}

function calculateNutritionClientSide(data) {
    // BMI Calculation
    const heightInMeters = data.height / 100;
    const bmi = data.weight / (heightInMeters * heightInMeters);
    
    // BMR Calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (data.gender === 'male') {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
    } else {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    }
    
    // Activity multipliers
    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very': 1.725,
        'extra': 1.9
    };
    
    const tdee = bmr * activityMultipliers[data.activity];
    
    // Macronutrient calculations
    const protein = data.weight * 2.2; // 2.2g per kg
    const fat = tdee * 0.25 / 9; // 25% of calories from fat
    const carbs = (tdee - (protein * 4) - (fat * 9)) / 4; // Remaining calories from carbs
    const water = data.weight * 0.035; // 35ml per kg
    
    return {
        bmi: Math.round(bmi * 10) / 10,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calories: Math.round(tdee),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        water: Math.round(water * 10) / 10
    };
}

function displayNutritionResults(results) {
    document.getElementById('bmiResult').textContent = results.bmi;
    document.getElementById('caloriesResult').textContent = results.calories;
    document.getElementById('proteinResult').textContent = results.protein + 'g';
    document.getElementById('carbsResult').textContent = results.carbs + 'g';
    document.getElementById('fatResult').textContent = results.fat + 'g';
    document.getElementById('waterResult').textContent = results.water + 'L';
    
    document.getElementById('nutritionResults').style.display = 'block';
    
    showAlert('Success! Your personalized nutrition plan is ready.', 'success');
}

// Dashboard Management
function initializeDashboard() {
    createProgressChart();
    updateDashboardStats();
}

function createProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    // Sample progress data
    const progressData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Calories Consumed',
            data: [1200, 1350, 1100, 1450, 1300, 1250, 1400],
            borderColor: '#16a085',
            backgroundColor: 'rgba(22, 160, 133, 0.1)',
            tension: 0.4
        }, {
            label: 'Calorie Goal',
            data: [1500, 1500, 1500, 1500, 1500, 1500, 1500],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderDash: [5, 5],
            tension: 0
        }]
    };
    
    AppState.progressChart = new Chart(ctx, {
        type: 'line',
        data: progressData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Nutrition Progress'
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                }
            }
        }
    });
}

function updateDashboardStats() {
    // Update with real data or defaults
    const stats = getFromLocalStorage('todayStats') || {
        calories: 1250,
        water: '1.5L',
        meals: 3
    };
    
    const caloriesEl = document.getElementById('caloriesConsumed');
    const waterEl = document.getElementById('waterIntake');
    const mealsEl = document.getElementById('mealsLogged');
    
    if (caloriesEl) caloriesEl.textContent = stats.calories;
    if (waterEl) waterEl.textContent = stats.water;
    if (mealsEl) mealsEl.textContent = stats.meals;
}

function updateDashboard() {
    updateDashboardStats();
    if (AppState.progressChart) {
        AppState.progressChart.update();
    }
}

// Recipe/Meal Management
async function searchRecipes() {
    const ingredients = document.getElementById('ingredientSearch').value;
    if (!ingredients.trim()) {
        showAlert('Please enter some ingredients to search for recipes.', 'warning');
        return;
    }
    
    showLoading('Searching for healthy recipes...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: ingredients })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecipes(data.recipes);
        } else {
            throw new Error('Failed to search recipes');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback to sample recipes
        displaySampleRecipes();
    }
    
    hideLoading();
}

function displayRecipes(recipes) {
    const recipeGrid = document.getElementById('recipeResults');
    if (!recipeGrid) return;
    
    recipeGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeGrid.appendChild(recipeCard);
    });
}

function displaySampleRecipes() {
    const sampleRecipes = [
        {
            id: 'healthy-salad',
            name: 'Protein Power Salad',
            description: 'Mixed greens with grilled chicken and quinoa',
            calories: 420,
            protein: 35,
            prepTime: 20,
            image: 'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="200" fill="%2316a085"/%3E%3Ctext x="150" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy="8"%3E🥗 Protein Salad%3C/text%3E%3C/svg%3E'
        },
        {
            id: 'fish-rice',
            name: 'Baked Salmon & Brown Rice',
            description: 'Omega-3 rich salmon with fiber-packed brown rice',
            calories: 380,
            protein: 28,
            prepTime: 30,
            image: 'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="200" fill="%23e67e22"/%3E%3Ctext x="150" y="95" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy="8"%3E🐟 Salmon &%3C/text%3E%3Ctext x="150" y="115" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy="8"%3EBrown Rice%3C/text%3E%3C/svg%3E'
        }
    ];
    
    displayRecipes(sampleRecipes);
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}">
        <div class="recipe-content">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <div class="recipe-nutrition">
                <span>🔥 ${recipe.calories} cal</span>
                <span>🥩 ${recipe.protein}g protein</span>
                <span>⏱️ ${recipe.prepTime} min</span>
            </div>
            <button onclick="logMeal('${recipe.id}')" class="btn-secondary">Log Meal</button>
        </div>
    `;
    return card;
}

async function logMeal(mealId) {
    try {
        const response = await fetch(`${API_BASE_URL}/meals/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                meal_id: mealId,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            showAlert('Meal logged successfully! 🍽️', 'success');
            updateDashboardStats();
        } else {
            throw new Error('Failed to log meal');
        }
    } catch (error) {
        console.error('Error:', error);
        // Update local stats as fallback
        const currentStats = getFromLocalStorage('todayStats') || {
            calories: 1250, water: '1.5L', meals: 3
        };
        currentStats.meals += 1;
        saveToLocalStorage('todayStats', currentStats);
        updateDashboardStats();
        showAlert('Meal logged locally! 🍽️', 'success');
    }
}

function loadMealSuggestions() {
    displaySampleRecipes();
}

// AI Chat System
function setupChat() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    addTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message
            })
        });
        
        removeTypingIndicator();
        
        if (response.ok) {
            const data = await response.json();
            addMessageToChat(data.response, 'bot');
        } else {
            throw new Error('AI service unavailable');
        }
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        // Fallback to local responses
        const localResponse = generateLocalResponse(message);
        addMessageToChat(localResponse, 'bot');
    }
}

function askQuestion(question) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = question;
        sendMessage();
    }
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save to chat history
    AppState.chatHistory.push({ message, sender, timestamp: new Date() });
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="loading"></div> AI is thinking...
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Advanced Language Detection and Support
function detectLanguage(message) {
    const languagePatterns = {
        'ar': /[؀-ۿ]/, // Arabic
        'am': /[ሀ-፿]/, // Amharic
        'sw': /\b(habari|chakula|afya|maji|protein)\b/i, // Swahili keywords
        'fr': /\b(bonjour|nutrition|santé|eau|protéine)\b/i, // French keywords
        'es': /\b(hola|nutrición|salud|agua|proteína)\b/i, // Spanish keywords
        'pt': /\b(olá|nutrição|saúde|água|proteína)\b/i, // Portuguese keywords
        'hi': /[ऀ-ॿ]/, // Hindi
        'zh': /[一-鿿]/, // Chinese
        'ja': /[぀-ゟ゠-ヿ一-龯]/, // Japanese
        'ko': /[가-힯]/, // Korean
        'ru': /[Ѐ-ӿ]/, // Russian
        'de': /\b(hallo|ernährung|gesundheit|wasser|protein)\b/i, // German keywords
        'it': /\b(ciao|nutrizione|salute|acqua|proteina)\b/i, // Italian keywords
    };
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(message)) {
            return lang;
        }
    }
    return 'en'; // Default to English
}

function getMultilingualResponse(topic, language) {
    const multilingualResponses = {
        // PROTEIN responses in multiple languages
        protein: {
            'en': "🥩 **PROTEIN GUIDANCE:**\n\n• **Daily needs:** 0.8-2.2g per kg body weight\n• **Athletes:** Up to 2.2g/kg for muscle building\n• **Best sources:** Lean meats, fish, eggs, legumes, Greek yogurt, quinoa\n• **Tip:** Spread protein throughout the day for better absorption!\n\n*Would you like specific protein-rich recipe ideas?*",
            'ar': "🥩 **دليل البروتين:**\n\n• **الحاجة اليومية:** 0.8-2.2 جرام لكل كيلو من وزن الجسم\n• **للرياضيين:** حتى 2.2 جرام/كيلو لبناء العضلات\n• **أفضل المصادر:** اللحوم الخالية من الدهون، السمك، البيض، البقوليات، الزبادي اليوناني، الكينوا\n• **نصيحة:** وزع البروتين على مدار اليوم للحصول على امتصاص أفضل!\n\n*هل تريد أفكار وصفات غنية بالبروتين؟*",
            'fr': "🥩 **GUIDE PROTÉINES:**\n\n• **Besoins quotidiens:** 0,8-2,2g par kg de poids corporel\n• **Athlètes:** Jusqu'à 2,2g/kg pour la construction musculaire\n• **Meilleures sources:** Viandes maigres, poisson, œufs, légumineuses, yaourt grec, quinoa\n• **Conseil:** Répartissez les protéines tout au long de la journée pour une meilleure absorption!\n\n*Voulez-vous des idées de recettes riches en protéines?*",
            'es': "🥩 **GUÍA DE PROTEÍNAS:**\n\n• **Necesidades diarias:** 0.8-2.2g por kg de peso corporal\n• **Atletas:** Hasta 2.2g/kg para construcción muscular\n• **Mejores fuentes:** Carnes magras, pescado, huevos, legumbres, yogur griego, quinoa\n• **Consejo:** ¡Distribuye la proteína durante el día para mejor absorción!\n\n*¿Quieres ideas de recetas ricas en proteínas?*",
            'sw': "🥩 **MWONGOZO WA PROTINI:**\n\n• **Mahitaji ya kila siku:** 0.8-2.2g kwa kilo ya uzito wa mwili\n• **Wanariadha:** Hadi 2.2g/kilo kwa kujenga misuli\n• **Vyanzo bora:** Nyama konda, samaki, mayai, kunde, yogurt ya Kigiriki, quinoa\n• **Dokezo:** Sambaza protini siku nzima kwa mmeng'enyo bora!\n\n*Je, unataka mawazo ya mapishi yenye protini nyingi?*",
            'am': "🥩 **የፕሮቲን መመሪያ:**\n\n• **የቀን ፍላጎት:** በሰውነት ክብደት ኪሎግራም 0.8-2.2 ግራም\n• **ለስፖርተኞች:** ለጡንቻ ግንባታ እስከ 2.2ግ/ኪግ\n• **ምርጥ ምንጮች:** ቀጭን ስጋ፣ ዓሳ፣ እንቁላል፣ ባቄላ፣ የግሪክ እርጎ፣ ኪኖዋ\n• **ምክር:** ለተሻለ መሳብ ፕሮቲኑን በቀኑ ይከፋፍሉ!\n\n*ፕሮቲን በበዛበት የምግብ አዘገጃጀት ሀሳቦችን ይፈልጋሉ?*"
        },
        
        // WATER responses in multiple languages
        water: {
            'en': "💧 **HYDRATION ESSENTIALS:**\n\n• **Basic rule:** 8 glasses (2L) daily minimum\n• **Activity boost:** +500ml per hour of exercise\n• **Climate factor:** More in hot/humid weather\n• **Quality signs:** Pale yellow urine, good energy levels\n• **Flavor tips:** Add lemon, cucumber, or mint!\n\n*Track your intake with our water logging feature!*",
            'ar': "💧 **أساسيات الترطيب:**\n\n• **القاعدة الأساسية:** 8 أكواب (2 لتر) يومياً كحد أدنى\n• **زيادة النشاط:** +500 مل لكل ساعة تمرين\n• **عامل المناخ:** أكثر في الطقس الحار والرطب\n• **علامات الجودة:** بول أصفر فاتح، مستويات طاقة جيدة\n• **نصائح النكهة:** أضف الليمون أو الخيار أو النعناع!\n\n*تتبع استهلاكك مع ميزة تسجيل الماء لدينا!*",
            'fr': "💧 **ESSENTIELS D'HYDRATATION:**\n\n• **Règle de base:** 8 verres (2L) minimum par jour\n• **Boost d'activité:** +500ml par heure d'exercice\n• **Facteur climatique:** Plus par temps chaud/humide\n• **Signes de qualité:** Urine jaune pâle, bons niveaux d'énergie\n• **Conseils saveur:** Ajoutez citron, concombre ou menthe!\n\n*Suivez votre consommation avec notre fonction de suivi de l'eau!*",
            'sw': "💧 **MAMBO MUHIMU YA MAJI:**\n\n• **Kanuni ya msingi:** Vikombe 8 (lita 2) kwa siku\n• **Kuongeza shughuli:** +500ml kwa saa ya mazoezi\n• **Kipengele cha hali ya hewa:** Zaidi wakati wa joto/unyevu\n• **Dalili za ubora:** Mkojo wa manjano mwepesi, viwango vya nishati vizuri\n• **Vidokezo vya ladha:** Ongeza ndimu, tango au nanaa!\n\n*Fuatilia matumizi yako na kipengele chetu cha kurekodi maji!*",
            'am': "💧 **የውኃ አስፈላጊ ነገሮች:**\n\n• **መሰረታዊ ህግ:** በቀን ቢያንስ 8 ኩባያ (2 ሊትር)\n• **የአካል ብቃት እንቅስቃሴ መጨመሪያ:** በአንድ ሰዓት የአካል ብቃት እንቅስቃሴ +500ml\n• **የየብስ ሁኔታ ምክንያት:** በሙቅ/እርጥብ አየር ውስጥ ብዙ\n• **የጥራት ምልክቶች:** ደብዛዛ ቢጫ ሽንት፣ ጥሩ የኃይል ደረጃ\n• **የጣዕም ምክሮች:** ሎሚ፣ ዳቦ ወይም ዕጣን ያክሉ!\n\n*በእኛ የውሃ ምዝገባ ባህሪ ቅበላዎን ይከታተሉ!*"
        },
        
        // WEIGHT LOSS responses
        'lose weight': {
            'en': "🎯 **WEIGHT LOSS STRATEGY:**\n\n• **Create deficit:** Eat less + move more (but safely!)\n• **Meal timing:** Don't skip meals, eat every 3-4 hours\n• **Protein priority:** Keeps you full and preserves muscle\n• **Sleep matters:** 7-9 hours for hormone balance\n• **Be patient:** Healthy loss takes time but lasts!\n\n*Start with our personalized nutrition plan!*",
            'ar': "🎯 **استراتيجية فقدان الوزن:**\n\n• **إنشاء عجز:** كل أقل + تحرك أكثر (لكن بأمان!)\n• **توقيت الوجبات:** لا تتخط الوجبات، كل كل 3-4 ساعات\n• **أولوية البروتين:** يبقيك ممتلئاً ويحافظ على العضلات\n• **النوم مهم:** 7-9 ساعات لتوازن الهرمونات\n• **كن صبوراً:** الفقدان الصحي يحتاج وقت لكنه يدوم!\n\n*ابدأ بخطة التغذية المخصصة لدينا!*",
            'fr': "🎯 **STRATÉGIE DE PERTE DE POIDS:**\n\n• **Créer un déficit:** Manger moins + bouger plus (mais en sécurité!)\n• **Timing des repas:** Ne sautez pas de repas, mangez toutes les 3-4 heures\n• **Priorité aux protéines:** Vous garde rassasié et préserve les muscles\n• **Le sommeil compte:** 7-9 heures pour l'équilibre hormonal\n• **Soyez patient:** La perte saine prend du temps mais dure!\n\n*Commencez avec notre plan nutritionnel personnalisé!*"
        }
    };
    
    return multilingualResponses[topic]?.[language] || multilingualResponses[topic]?.['en'] || null;
}

function generateLocalResponse(message) {
    // First check for African food responses
    const africanResponse = generateLocalResponseWithAfricanFoods(message);
    if (africanResponse) {
        return africanResponse;
    }
    
    // Detect language first
    const detectedLanguage = detectLanguage(message);
    const lowerMessage = message.toLowerCase();
    
    // Enhanced keyword matching with multilingual support
    const keywords = {
        'protein': ['protein', 'protien', 'protine', 'بروتين', 'protéine', 'proteína', 'protini', 'ፕሮቲን'],
        'water': ['water', 'hydration', 'drink', 'مياه', 'ماء', 'eau', 'agua', 'maji', 'ውኃ'],
        'lose weight': ['lose weight', 'weight loss', 'diet', 'slim', 'فقدان الوزن', 'perdre du poids', 'perder peso', 'kupunguza uzito'],
        'gain weight': ['gain weight', 'build muscle', 'bulk', 'زيادة الوزن', 'prendre du poids', 'ganar peso'],
        'calories': ['calories', 'calorie', 'energy', 'سعرات', 'calories', 'calorías'],
        'exercise': ['exercise', 'workout', 'fitness', 'gym', 'تمرين', 'exercice', 'ejercicio', 'mazoezi'],
        'breakfast': ['breakfast', 'morning meal', 'إفطار', 'petit-déjeuner', 'desayuno', 'chakula cha asubuhi'],
        'stress': ['stress', 'anxiety', 'mental health', 'ضغط', 'stress', 'estrés', 'msongo wa mawazo'],
        'sleep': ['sleep', 'rest', 'insomnia', 'نوم', 'sommeil', 'sueño', 'usingizi'],
        'diabetes': ['diabetes', 'blood sugar', 'glucose', 'سكري', 'diabète', 'diabetes', 'kisukari'],
        'heart health': ['heart', 'cardiovascular', 'blood pressure', 'قلب', 'cœur', 'corazón', 'moyo']
    };
    
    // Find matching topics
    const matchedTopics = [];
    for (const [topic, variations] of Object.entries(keywords)) {
        for (const variation of variations) {
            if (lowerMessage.includes(variation.toLowerCase())) {
                matchedTopics.push({ topic, specificity: variation.length });
                break;
            }
        }
    }
    
    // Get multilingual response if available
    if (matchedTopics.length > 0) {
        matchedTopics.sort((a, b) => b.specificity - a.specificity);
        const bestMatch = matchedTopics[0].topic;
        
        const multilingualResponse = getMultilingualResponse(bestMatch, detectedLanguage);
        if (multilingualResponse) {
            return multilingualResponse;
        }
    }
    
    // Fallback to enhanced English responses
    const responses = {
        // Macronutrients
        protein: "🥩 **PROTEIN GUIDANCE:**\n\n• **Daily needs:** 0.8-2.2g per kg body weight\n• **Athletes:** Up to 2.2g/kg for muscle building\n• **Best sources:** Lean meats, fish, eggs, legumes, Greek yogurt, quinoa\n• **Tip:** Spread protein throughout the day for better absorption!\n\n*Would you like specific protein-rich recipe ideas?*",
        
        carbs: "🍞 **CARBOHYDRATE WISDOM:**\n\n• **Choose complex carbs:** Whole grains, oats, sweet potatoes, legumes\n• **Timing matters:** Have carbs pre/post workout for energy\n• **Portion guide:** 1/2 your plate should be complex carbs & vegetables\n• **Avoid:** Refined sugars, white bread, processed foods\n\n*Need meal ideas with healthy carbs?*",
        
        fat: "🥑 **HEALTHY FATS GUIDE:**\n\n• **Good fats:** Avocados, nuts, olive oil, fatty fish, seeds\n• **Daily amount:** 20-35% of total calories\n• **Benefits:** Brain health, hormone production, vitamin absorption\n• **Limit:** Saturated fats, avoid trans fats completely\n\n*Want omega-3 rich meal suggestions?*",
        
        // Hydration & Water
        water: "💧 **HYDRATION ESSENTIALS:**\n\n• **Basic rule:** 8 glasses (2L) daily minimum\n• **Activity boost:** +500ml per hour of exercise\n• **Climate factor:** More in hot/humid weather\n• **Quality signs:** Pale yellow urine, good energy levels\n• **Flavor tips:** Add lemon, cucumber, or mint!\n\n*Track your intake with our water logging feature!*",
        
        hydration: "💦 **STAY HYDRATED:**\n\n• **Morning start:** Drink 2 glasses upon waking\n• **Before meals:** 1 glass 30 minutes before eating\n• **During exercise:** Sip every 15-20 minutes\n• **Signs of dehydration:** Headache, fatigue, dark urine\n• **Hydrating foods:** Watermelon, cucumber, oranges, soup\n\n*Set hydration reminders in your profile!*",
        
        // Weight Management
        weight: "⚖️ **SUSTAINABLE WEIGHT MANAGEMENT:**\n\n• **Safe rate:** 0.5-1kg per week maximum\n• **Calorie deficit:** 500-750 calories below maintenance\n• **Focus on:** Whole foods, portion control, regular meals\n• **Exercise combo:** Cardio + strength training\n• **Track progress:** Weight + measurements + how you feel\n\n*Use our nutrition calculator for personalized goals!*",
        
        "lose weight": "🎯 **WEIGHT LOSS STRATEGY:**\n\n• **Create deficit:** Eat less + move more (but safely!)\n• **Meal timing:** Don't skip meals, eat every 3-4 hours\n• **Protein priority:** Keeps you full and preserves muscle\n• **Sleep matters:** 7-9 hours for hormone balance\n• **Be patient:** Healthy loss takes time but lasts!\n\n*Start with our personalized nutrition plan!*",
        
        "gain weight": "💪 **HEALTHY WEIGHT GAIN:**\n\n• **Surplus needed:** 300-500 calories above maintenance\n• **Quality calories:** Nuts, avocado, lean meats, whole grains\n• **Frequent meals:** 5-6 smaller meals daily\n• **Strength training:** Build muscle, not just fat\n• **Healthy fats:** Easy way to add calories\n\n*Let's calculate your target calories!*",
        
        // Specific Nutrients
        calories: "🔥 **CALORIE WISDOM:**\n\n• **Individual needs:** Vary by age, gender, activity, goals\n• **Quality matters:** 100 calories of apple ≠ 100 calories of candy\n• **Don't go too low:** Minimum 1200 for women, 1500 for men\n• **Track trends:** Weekly averages, not daily perfection\n• **Listen to body:** Hunger and energy are important signals\n\n*Use our calculator for your personalized needs!*",
        
        fiber: "🌾 **FIBER BENEFITS:**\n\n• **Daily goal:** 25g (women), 35g (men)\n• **Sources:** Beans, berries, vegetables, whole grains\n• **Benefits:** Better digestion, heart health, blood sugar control\n• **Increase slowly:** Avoid digestive discomfort\n• **Drink water:** Fiber needs fluid to work properly\n\n*Need high-fiber recipe ideas?*",
        
        vitamins: "🌈 **VITAMIN ESSENTIALS:**\n\n• **Eat the rainbow:** Different colors = different nutrients\n• **Key players:** A, C, D, E, K, B-complex\n• **Food first:** Whole foods better than supplements\n• **Seasonal eating:** Fresh, local produce when possible\n• **Storage tips:** Proper storage preserves nutrients\n\n*Ask about specific vitamins for detailed info!*",
        
        // Food Categories
        vegetables: "🥬 **VEGETABLE POWER:**\n\n• **Daily goal:** 5-9 servings (2-4 cups)\n• **Variety is key:** Different colors provide different nutrients\n• **Cooking methods:** Steam, roast, or eat raw for max nutrition\n• **Easy additions:** Smoothies, soups, stir-fries\n• **Seasonal picks:** Fresher, cheaper, more nutritious\n\n*Want vegetable-packed recipe suggestions?*",
        
        fruits: "🍎 **FRUIT WISDOM:**\n\n• **Daily serving:** 2-4 pieces or cups\n• **Whole over juice:** More fiber, less sugar spike\n• **Berry power:** Highest antioxidants, lower sugar\n• **Timing tip:** Great pre-workout energy\n• **Frozen option:** Just as nutritious as fresh\n\n*Looking for low-sugar fruit options?*",
        
        snacks: "🥜 **SMART SNACKING:**\n\n• **Balanced combo:** Protein + healthy carbs/fats\n• **Great options:** Apple + almond butter, Greek yogurt + berries\n• **Portion control:** Pre-portion to avoid overeating\n• **Timing:** Between meals when truly hungry\n• **Avoid:** Processed snacks, mindless eating\n\n*Want personalized snack suggestions?*",
        
        // Exercise & Nutrition
        exercise: "💪 **FITNESS NUTRITION:**\n\n• **Pre-workout:** Light carbs 30-60 minutes before\n• **Post-workout:** Protein + carbs within 30 minutes\n• **Hydration:** Drink before, during, and after\n• **Weekly goal:** 150 min moderate or 75 min vigorous cardio\n• **Strength training:** 2-3 times per week\n\n*Need pre/post workout meal ideas?*",
        
        "muscle building": "🏋️ **MUSCLE BUILDING NUTRITION:**\n\n• **Protein timing:** 20-30g per meal, especially post-workout\n• **Calorie surplus:** Slight surplus (200-500 calories)\n• **Carb timing:** Around workouts for energy and recovery\n• **Recovery foods:** Chocolate milk, protein smoothies\n• **Consistency:** Regular meals and workout schedule\n\n*Want a muscle-building meal plan?*",
        
        // Meal Planning
        breakfast: "🌅 **BREAKFAST EXCELLENCE:**\n\n• **Never skip:** Kickstarts metabolism and brain function\n• **Protein power:** Keeps you full longer\n• **Great options:** Oatmeal + nuts, Greek yogurt + fruit, eggs + vegetables\n• **Prep ahead:** Overnight oats, egg muffins\n• **Balance:** Protein + complex carbs + healthy fats\n\n*Want quick breakfast recipes?*",
        
        "meal prep": "📦 **MEAL PREP SUCCESS:**\n\n• **Start simple:** 2-3 recipes, make in batches\n• **Storage:** Glass containers, proper portions\n• **Timeline:** 1-2 hours on weekends\n• **Variety:** Mix proteins, grains, and vegetables\n• **Safety:** Proper cooling and refrigeration\n\n*Need beginner-friendly prep recipes?*",
        
        // Health Conditions
        diabetes: "🩺 **DIABETES-FRIENDLY EATING:**\n\n• **Carb awareness:** Count and distribute throughout day\n• **Fiber focus:** Slows sugar absorption\n• **Protein pairing:** Helps stabilize blood sugar\n• **Regular meals:** Prevents blood sugar spikes/drops\n• **Monitor:** Work with healthcare team\n\n*Always consult your doctor for medical advice!*",
        
        "heart health": "❤️ **HEART-HEALTHY CHOICES:**\n\n• **Mediterranean style:** Olive oil, fish, nuts, vegetables\n• **Limit sodium:** <2300mg daily (1 tsp salt)\n• **Omega-3s:** Fatty fish 2x per week\n• **Fiber rich:** Oats, beans, fruits, vegetables\n• **Limit saturated fat:** <10% of daily calories\n\n*Want heart-healthy recipe ideas?*",
        
        // Special Situations
        pregnancy: "🤱 **PREGNANCY NUTRITION:**\n\n• **Extra calories:** +340 (2nd tri), +450 (3rd tri)\n• **Folic acid:** Leafy greens, fortified grains\n• **Iron rich:** Lean meat, beans, spinach\n• **Calcium:** Dairy, fortified alternatives\n• **Avoid:** Raw fish, unpasteurized products, excess caffeine\n\n*Please consult your healthcare provider!*",
        
        stress: "😌 **STRESS & NUTRITION:**\n\n• **Stress busters:** Dark chocolate, green tea, berries\n• **Magnesium:** Nuts, seeds, leafy greens\n• **B vitamins:** Whole grains, eggs, legumes\n• **Avoid:** Excess caffeine, alcohol, sugar\n• **Regular meals:** Prevents blood sugar stress\n\n*Try our wellness tracking features!*",
        
        sleep: "😴 **SLEEP NUTRITION:**\n\n• **Light dinner:** 2-3 hours before bed\n• **Sleep promoters:** Cherries, almonds, turkey\n• **Avoid:** Large meals, caffeine, alcohol before bed\n• **Magnesium:** Natural sleep aid in nuts, seeds\n• **Tryptophan:** Turkey, milk, bananas\n\n*Track sleep in our wellness section!*",
        
        // Kitchen & Cooking
        cooking: "👨‍🍳 **HEALTHY COOKING TIPS:**\n\n• **Methods:** Grill, bake, steam, stir-fry vs. deep fry\n• **Seasoning:** Herbs and spices instead of salt\n• **Oil choice:** Olive oil for low heat, avocado for high heat\n• **Meal prep:** Batch cook proteins and grains\n• **Keep simple:** Fresh ingredients need minimal preparation\n\n*Want easy, healthy recipes to start with?*",
        
        budget: "💰 **BUDGET-FRIENDLY NUTRITION:**\n\n• **Protein bargains:** Eggs, beans, lentils, canned fish\n• **Bulk buys:** Rice, oats, frozen vegetables\n• **Seasonal produce:** Cheaper and more nutritious\n• **Generic brands:** Same nutrition, lower cost\n• **Cook at home:** Much cheaper than eating out\n\n*Need affordable meal planning help?*",
        
        // Encouragement
        motivation: "🌟 **STAY MOTIVATED:**\n\n• **Small steps:** One healthy choice at a time\n• **Progress tracking:** Celebrate small wins\n• **Community:** Join our challenges and leaderboard\n• **Flexibility:** 80/20 rule - aim for 80% healthy choices\n• **Self-compassion:** Bad days happen, get back on track\n\n*Check out our community features for support!*",
        
        help: "🍎 **I'M HERE TO HELP!**\n\nI can provide guidance on:\n• 🥗 **Nutrition basics** (macros, portions, meal timing)\n• 🏃‍♀️ **Fitness nutrition** (pre/post workout, muscle building)\n• ⚖️ **Weight management** (healthy loss/gain strategies)\n• 🥘 **Meal planning** (prep, recipes, budget tips)\n• 💪 **Wellness** (sleep, stress, hydration)\n• 🏥 **Health conditions** (general guidance - see doctor!)\n\n*Ask me anything specific or explore our app features!*",
        
        default: "🍎 **I'M YOUR NUTRITION ASSISTANT!**\n\nI'm here to help with:\n• 🥗 **Nutrition questions** (calories, protein, vitamins)\n• 🍽️ **Healthy recipes** and meal ideas\n• ⚖️ **Weight management** strategies\n• 💪 **Wellness tips** (sleep, stress, hydration)\n• 🏃‍♀️ **Exercise nutrition** guidance\n\n**Try asking:**\n• \"How much protein do I need?\"\n• \"What are healthy breakfast ideas?\"\n• \"How can I lose weight safely?\"\n• \"What foods help with stress?\"\n\n*I'm always learning to help you better! 🌟*"
    };
    
    // Check for multiple keywords and return the most specific match
    const matchedKeys = [];
    for (const [key, response] of Object.entries(responses)) {
        if (key !== 'default' && lowerMessage.includes(key)) {
            matchedKeys.push({ key, response, specificity: key.length });
        }
    }
    
    // Return most specific match (longest keyword)
    if (matchedKeys.length > 0) {
        matchedKeys.sort((a, b) => b.specificity - a.specificity);
        return matchedKeys[0].response;
    }
    
    return responses.default;
}

// ===== ADVANCED FEATURES =====

function setupAdvancedFeatures() {
    // Setup stress level slider
    setTimeout(() => {
        const stressSlider = document.getElementById('stressLevel');
        if (stressSlider) {
            stressSlider.addEventListener('input', function() {
                const valueDisplay = document.getElementById('stressValue');
                if (valueDisplay) {
                    valueDisplay.textContent = this.value;
                }
            });
        }
    }, 100);
}

// Wellness Tracking Functions
function trackWellness() {
    const sleepHours = parseFloat(document.getElementById('sleepHours').value) || 8;
    const stressLevel = parseInt(document.getElementById('stressLevel').value) || 5;
    
    showLoading('Analyzing your wellness data...');
    
    fetch(`${API_BASE_URL}/wellness/sleep-stress`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            sleep_hours: sleepHours,
            stress_level: stressLevel
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayWellnessResults(data);
        }
    })
    .catch(error => {
        console.error('Wellness tracking error:', error);
        // Fallback wellness calculation
        const wellnessScore = Math.round(((sleepHours / 8) * 50) + Math.max(0, 50 - (stressLevel * 5)));
        displayWellnessResults({
            wellness_score: wellnessScore,
            recommendations: [
                {
                    message: sleepHours < 7 ? '💤 Try to get 7-9 hours of sleep' : '🌟 Great sleep habits!',
                    action: sleepHours < 7 ? 'Consider magnesium-rich foods before bed' : 'Keep up the good work!'
                }
            ]
        });
    })
    .finally(() => hideLoading());
}

function displayWellnessResults(data) {
    const resultsDiv = document.getElementById('wellnessResults');
    if (!resultsDiv) return;
    
    let html = '<h4>🌟 Wellness Analysis</h4>';
    html += `<p><strong>Your Wellness Score:</strong> ${data.wellness_score}/100</p>`;
    
    if (data.recommendations && data.recommendations.length > 0) {
        html += '<div class="recommendations">';
        data.recommendations.forEach(rec => {
            html += `<div class="recommendation">`;
            html += `<p><strong>${rec.message}</strong></p>`;
            html += `<p><em>${rec.action}</em></p>`;
            html += `</div>`;
        });
        html += '</div>';
    }
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

// Voice Assistant Functions
function startVoiceCommand() {
    const language = document.getElementById('voiceLanguage').value;
    
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        // Fallback for browsers without speech recognition
        const testText = prompt('Voice not supported. Enter your nutrition question:');
        if (testText) {
            processVoiceCommand(testText, language);
        }
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'en' ? 'en-US' : language;
    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        processVoiceCommand(text, language);
    };
    
    recognition.onerror = function(event) {
        showAlert('Voice recognition error. Please try again.', 'error');
    };
    
    recognition.start();
    showAlert('🎤 Listening... Speak your nutrition question now!', 'success');
}

function processVoiceCommand(text, language) {
    fetch(`${API_BASE_URL}/voice/process`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            text: text,
            language: language
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayVoiceResults(text, data.response, language);
        }
    })
    .catch(error => {
        console.error('Voice processing error:', error);
        // Fallback response
        displayVoiceResults(text, "I understand you're asking about nutrition. Please use the chat assistant for detailed help!", language);
    });
}

function displayVoiceResults(question, answer, language) {
    const resultsDiv = document.getElementById('voiceResults');
    if (!resultsDiv) return;
    
    const html = `
        <h4>🎤 Voice Command Results</h4>
        <p><strong>You asked (${language}):</strong> "${question}"</p>
        <p><strong>AI Response:</strong> ${answer}</p>
        <p><em>Language: ${getLanguageName(language)}</em></p>
    `;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'am': 'አማርኛ (Amharic)',
        'sw': 'Kiswahili',
        'fr': 'Français'
    };
    return languages[code] || 'English';
}

// Community Features
function loadLeaderboard() {
    fetch(`${API_BASE_URL}/community/leaderboard`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayLeaderboard(data.leaderboard);
        }
    })
    .catch(error => {
        console.error('Leaderboard error:', error);
        // Show sample leaderboard on error
        displaySampleLeaderboard();
    });
}

function displayLeaderboard(leaderboard) {
    const leaderboardDiv = document.getElementById('leaderboard');
    if (!leaderboardDiv) return;
    
    let html = '';
    leaderboard.forEach(user => {
        html += `
            <div class="leaderboard-item">
                <span class="rank">${user.badge} #${user.rank}</span>
                <span class="username">${user.username}</span>
                <span class="score">${user.score} pts</span>
                <span class="streak">${user.streak}-day streak</span>
            </div>
        `;
    });
    
    leaderboardDiv.innerHTML = html;
}

function displaySampleLeaderboard() {
    const sampleData = [
        {rank: 1, username: 'HealthHero123', score: 950, streak: 15, badge: '🏆'},
        {rank: 2, username: 'NutritionNinja', score: 890, streak: 12, badge: '🥈'},
        {rank: 3, username: 'WellnessWarrior', score: 850, streak: 10, badge: '🥉'}
    ];
    displayLeaderboard(sampleData);
}

function loadChallenges() {
    fetch(`${API_BASE_URL}/challenges/weekly`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayChallenges(data.challenges);
        }
    })
    .catch(error => {
        console.error('Challenges error:', error);
        // Show sample challenges on error
        displaySampleChallenges();
    });
}

function displayChallenges(challenges) {
    const challengesDiv = document.getElementById('challenges');
    if (!challengesDiv) return;
    
    let html = '';
    challenges.forEach(challenge => {
        const progressPercent = (challenge.progress / challenge.target) * 100;
        html += `
            <div class="challenge-card">
                <h4>${challenge.title}</h4>
                <p>${challenge.description}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercent}%;"></div>
                </div>
                <span class="progress-text">${challenge.progress}/${challenge.target} completed</span>
                <span class="reward">🏅 ${challenge.reward}</span>
            </div>
        `;
    });
    
    challengesDiv.innerHTML = html;
}

function displaySampleChallenges() {
    const sampleChallenges = [
        {
            title: '💧 Hydration Hero',
            description: 'Drink 8 glasses of water daily for 7 days',
            progress: 5,
            target: 7,
            reward: '50 points + Badge'
        },
        {
            title: '🥬 Veggie Champion',
            description: 'Eat 5 servings of vegetables daily',
            progress: 3,
            target: 7,
            reward: '75 points + Badge'
        }
    ];
    displayChallenges(sampleChallenges);
}

function calculateDonationImpact() {
    const amount = parseFloat(document.getElementById('donationAmount').value);
    
    if (!amount || amount <= 0) {
        showAlert('Please enter a valid donation amount.', 'warning');
        return;
    }
    
    fetch(`${API_BASE_URL}/donation/contribute`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            amount: amount,
            currency: 'USD'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayDonationImpact(data);
        }
    })
    .catch(error => {
        console.error('Donation calculation error:', error);
        // Fallback calculation
        const mealsProvided = Math.round(amount / 2);
        displayDonationImpact({
            impact_message: `Your $${amount} donation can provide ${mealsProvided} nutritious meals!`,
            thank_you: 'Thank you for fighting hunger! 🙏',
            sdg_impact: 'Directly contributing to SDG 2: Zero Hunger'
        });
    });
}

function displayDonationImpact(data) {
    const impactDiv = document.getElementById('donationImpact');
    if (!impactDiv) return;
    
    const html = `
        <h4>🙏 Your Donation Impact</h4>
        <p><strong>${data.impact_message}</strong></p>
        <p>💝 ${data.thank_you}</p>
        <p><em>SDG Impact: ${data.sdg_impact}</em></p>
    `;
    
    impactDiv.innerHTML = html;
    impactDiv.style.display = 'block';
}

// Sustainability Features
function checkSustainability() {
    const mealsList = document.getElementById('mealsList').value;
    
    if (!mealsList.trim()) {
        showAlert('Please list your recent meals to check sustainability.', 'warning');
        return;
    }
    
    // Convert meals list to array
    const meals = mealsList.split('\n').filter(meal => meal.trim()).map(meal => ({
        name: meal.trim()
    }));
    
    fetch(`${API_BASE_URL}/sustainability/score`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ meals: meals })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySustainabilityResults(data);
        }
    })
    .catch(error => {
        console.error('Sustainability check error:', error);
        // Fallback sustainability calculation
        const plantBasedCount = meals.filter(meal => 
            ['vegetable', 'fruit', 'quinoa', 'salad'].some(keyword => 
                meal.name.toLowerCase().includes(keyword)
            )
        ).length;
        const sustainabilityScore = Math.round((plantBasedCount / meals.length) * 100);
        
        displaySustainabilityResults({
            sustainability_score: sustainabilityScore,
            carbon_footprint: Math.round((2.5 - (sustainabilityScore * 0.02)) * 10) / 10,
            water_usage: Math.round(1000 - (sustainabilityScore * 5)),
            recommendations: sustainabilityScore < 70 ? [
                '🌱 Add more plant-based proteins',
                '♻️ Reduce food waste with meal planning'
            ] : ['🌟 Excellent sustainability choices!'],
            sdg_impact: 'Supporting sustainable food systems'
        });
    });
}

function displaySustainabilityResults(data) {
    const resultsDiv = document.getElementById('sustainabilityResults');
    if (!resultsDiv) return;
    
    let html = '<h4>🌱 Your Sustainability Report</h4>';
    html += `<p><strong>Sustainability Score:</strong> ${data.sustainability_score}/100</p>`;
    html += `<p><strong>Carbon Footprint:</strong> ${data.carbon_footprint} kg CO2</p>`;
    html += `<p><strong>Water Usage:</strong> ${data.water_usage} liters</p>`;
    
    if (data.recommendations && data.recommendations.length > 0) {
        html += '<h5>💡 Recommendations:</h5><ul>';
        data.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul>';
    }
    
    html += `<p><em>SDG Impact: ${data.sdg_impact}</em></p>`;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

function generateGroceryList() {
    const days = parseInt(document.getElementById('mealPlanDays').value) || 7;
    
    showLoading('Generating your smart grocery list...');
    
    fetch(`${API_BASE_URL}/grocery/generate-list`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            meal_plan: [{name: 'Sample meals'}],
            days: days
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayGroceryList(data.grocery_list, data.sustainability_tips);
        }
    })
    .catch(error => {
        console.error('Grocery list error:', error);
        // Fallback grocery list
        displayGroceryList({
            categories: {
                proteins: ['Chicken breast (1kg)', 'Eggs (12 pack)', 'Salmon fillet (500g)'],
                vegetables: ['Spinach (200g)', 'Broccoli (300g)', 'Tomatoes (500g)'],
                grains: ['Brown rice (1kg)', 'Quinoa (500g)', 'Whole wheat bread'],
                fruits: ['Bananas (6 pieces)', 'Apples (6 pieces)', 'Berries (250g)']
            },
            estimated_cost: '$45-60 USD'
        }, [
            '🌱 Choose organic when possible',
            '🌍 Buy local and seasonal produce',
            '♻️ Bring reusable bags'
        ]);
    })
    .finally(() => hideLoading());
}

function displayGroceryList(groceryData, tips) {
    const listDiv = document.getElementById('groceryList');
    if (!listDiv) return;
    
    let html = '<h4>🛒 Your Smart Grocery List</h4>';
    html += `<p><strong>Estimated Cost:</strong> ${groceryData.estimated_cost}</p>`;
    
    // Display categories
    for (const [category, items] of Object.entries(groceryData.categories)) {
        html += `<h5>${category.charAt(0).toUpperCase() + category.slice(1)}:</h5>`;
        html += '<ul>';
        items.forEach(item => {
            html += `<li>✓ ${item}</li>`;
        });
        html += '</ul>';
    }
    
    // Display sustainability tips
    if (tips && tips.length > 0) {
        html += '<h5>🌍 Sustainability Tips:</h5><ul>';
        tips.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        html += '</ul>';
    }
    
    listDiv.innerHTML = html;
    listDiv.style.display = 'block';
}

// Enhanced Food Nutrition Lookup with African Foods Integration
async function lookupFoodNutrition() {
    const food = document.getElementById('foodLookup').value.trim();
    
    if (!food) {
        showAlert('Please enter a food name to look up nutrition information.', 'warning');
        return;
    }
    
    showLoading('Looking up nutrition information...');
    
    // First check if it's a traditional African food
    const africanFood = findAfricanFood(food);
    if (africanFood) {
        displayAfricanFoodInfo(africanFood, food);
        hideLoading();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/nutrition/lookup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ food: food })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayNutritionLookup(data.nutrition, food);
        } else {
            throw new Error('Failed to lookup nutrition');
        }
    } catch (error) {
        console.error('Nutrition lookup error:', error);
        // Fallback nutrition data
        const fallbackNutrition = {
            calories: 100, protein: 5, carbs: 15, fat: 3, fiber: 2,
            serving_qty: 100, serving_unit: 'grams', source: 'estimated'
        };
        displayNutritionLookup(fallbackNutrition, food);
    }
    
    hideLoading();
}

function displayNutritionLookup(nutrition, foodName) {
    const resultDiv = document.getElementById('nutritionLookupResult');
    if (!resultDiv) return;
    
    let html = `<h4>🔍 Nutrition Facts: ${foodName}</h4>`;
    html += '<div class="nutrition-info">';
    
    const nutrients = {
        'Calories': nutrition.calories,
        'Protein': nutrition.protein + 'g',
        'Carbs': nutrition.carbs + 'g',
        'Fat': nutrition.fat + 'g',
        'Fiber': nutrition.fiber + 'g'
    };
    
    for (const [label, value] of Object.entries(nutrients)) {
        html += `
            <div class="nutrition-item">
                <span class="nutrition-label">${label}</span>
                <span class="nutrition-value">${value}</span>
            </div>
        `;
    }
    
    html += '</div>';
    html += `<div class="nutrition-serving">Per ${nutrition.serving_qty} ${nutrition.serving_unit}</div>`;
    html += `<div class="nutrition-source">Source: ${nutrition.source}</div>`;
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

// Utility Functions
function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-size: 1.2rem;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div class="loading" style="margin: 0 auto 1rem;"></div>
            <div>${message}</div>
        </div>
    `;
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at top of main content
    const main = document.querySelector('.main .container');
    if (main) {
        main.insertBefore(alertDiv, main.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(`smarteats_${key}`, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(`smarteats_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

function loadUserProfile() {
    const savedProfile = getFromLocalStorage('userProfile');
    const savedResults = getFromLocalStorage('nutritionResults');
    
    if (savedProfile && savedResults) {
        AppState.userProfile = savedProfile;
        AppState.nutritionResults = savedResults;
        displayNutritionResults(savedResults);
        
        // Populate form with saved data
        if (document.getElementById('age')) {
            document.getElementById('age').value = savedProfile.age;
            document.getElementById('gender').value = savedProfile.gender;
            document.getElementById('height').value = savedProfile.height;
            document.getElementById('weight').value = savedProfile.weight;
            document.getElementById('activity').value = savedProfile.activity;
        }
    }
}

// === JWT TOKEN MANAGEMENT ===

function saveAuthToken(token) {
    localStorage.setItem('smarteats_auth_token', token);
}

function getAuthToken() {
    return localStorage.getItem('smarteats_auth_token');
}

function clearAuthToken() {
    localStorage.removeItem('smarteats_auth_token');
}

function getAuthHeaders() {
    const token = getAuthToken();
    return token ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    } : {
        'Content-Type': 'application/json'
    };
}

// === AUTHENTICATION SYSTEM ===

function setupAuthentication() {
    // Setup form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Setup modal close on click outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('auth-modal')) {
            closeAuthModals();
        }
    });
}

function checkAuthStatus() {
    const savedUser = getFromLocalStorage('currentUser');
    if (savedUser) {
        loginUser(savedUser);
    }
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeAuthModals() {
    closeLoginModal();
    closeSignupModal();
    document.getElementById('welcomeModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('Please fill in all fields.', 'error');
        return;
    }
    
    showLoading('Signing you in...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Save JWT token
            saveAuthToken(data.access_token);
            
            // Create user object from API response
            const user = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                is_premium: data.user.is_premium,
                joinDate: new Date().toISOString()
            };
            
            loginUser(user);
            closeLoginModal();
            showWelcomeModal();
            showAlert('🎉 Welcome back! Ready to continue your health journey?', 'success');
            
            // Reset form
            document.getElementById('loginForm').reset();
            
        } else {
            // Handle API error response
            showAlert(data.message || 'Login failed. Please check your credentials.', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check your connection and try again.', 'error');
    }
    
    hideLoading();
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showAlert('Please agree to the Terms of Service.', 'error');
        return;
    }
    
    showLoading('Creating your account...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Save JWT token
            saveAuthToken(data.access_token);
            
            // Create user object from API response
            const user = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                is_premium: false, // New users are not premium by default
                joinDate: new Date().toISOString()
            };
            
            loginUser(user);
            closeSignupModal();
            showWelcomeModal();
            showAlert('🎉 Welcome to SmartEats! Your account has been created successfully.', 'success');
            
            // Reset form
            document.getElementById('signupForm').reset();
            
        } else {
            // Handle API error response
            if (response.status === 409) {
                showAlert('An account with this email already exists. Please try logging in.', 'error');
            } else {
                showAlert(data.message || 'Registration failed. Please try again.', 'error');
            }
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        console.log('📡 API URL attempted:', API_BASE_URL);
        
        // Enhanced error handling for production
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
            showAlert('🌐 Backend service is currently unavailable. You can still use the app offline! All features except cloud sync will work perfectly.', 'warning');
            
            // Create offline user account
            const offlineUser = {
                id: 'offline_' + Date.now(),
                name: name,
                email: email,
                is_premium: false,
                joinDate: new Date().toISOString(),
                isOffline: true
            };
            
            loginUser(offlineUser);
            closeSignupModal();
            showWelcomeModal();
            showAlert('🎉 Welcome to SmartEats! Account created locally. All features available offline!', 'success');
            document.getElementById('signupForm').reset();
        } else {
            showAlert('Network error. Please check your connection and try again, or continue offline.', 'error');
        }
    }
    
    hideLoading();
}

function loginUser(user) {
    AppState.isAuthenticated = true;
    AppState.currentUser = user;
    saveToLocalStorage('currentUser', user);
    
    // Update UI
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('signupBtn').style.display = 'none';
    document.getElementById('profileBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('username').textContent = user.name;
}

function logout() {
    AppState.isAuthenticated = false;
    AppState.currentUser = null;
    localStorage.removeItem('smarteats_currentUser');
    
    // Clear JWT authentication token
    clearAuthToken();
    
    // Update UI
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('signupBtn').style.display = 'block';
    document.getElementById('profileBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    
    showAlert('You have been logged out. Thanks for using SmartEats!', 'info');
}

function showWelcomeModal() {
    document.getElementById('welcomeModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function startOnboarding() {
    closeAuthModals();
    switchTab('nutrition');
    showAlert('Let\'s start by calculating your personalized nutrition needs! 🎯', 'success');
}

function skipOnboarding() {
    closeAuthModals();
    showAlert('You can set up your profile anytime by clicking "My Profile"! 👤', 'info');
}

function forgotPassword() {
    const email = prompt('Enter your email address for password reset:');
    if (email) {
        showAlert('Password reset link sent to ' + email + ' (demo mode)', 'info');
    }
}

function showTerms() {
    alert('SmartEats Terms of Service (Demo):\n\n- Support UN SDG 2: Zero Hunger\n- Support UN SDG 3: Good Health\n- Use responsibly for health purposes\n- Data privacy respected');
}

// Enhanced Start Health Journey function
function startHealthJourney() {
    if (!AppState.isAuthenticated) {
        showAlert('Please login or sign up to start your health journey! 🚀', 'info');
        openSignupModal();
        return;
    }
    
    // User is authenticated, take them to nutrition calculator
    switchTab('nutrition');
    showAlert('Great! Let\'s calculate your personalized nutrition needs to get started! 🎯', 'success');
    
    // Scroll to the nutrition form
    setTimeout(() => {
        const nutritionSection = document.getElementById('nutrition');
        if (nutritionSection) {
            nutritionSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 500);
}

// === PROFILE MANAGEMENT ===

function openProfileModal() {
    if (!AppState.isAuthenticated) {
        openLoginModal();
        return;
    }
    
    document.getElementById('profileModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    loadProfileData();
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadProfileData() {
    if (AppState.currentUser) {
        const profileName = document.getElementById('profileName');
        const profileNameInput = document.getElementById('profileNameInput');
        const profileEmail = document.getElementById('profileEmail');
        
        if (profileName) profileName.textContent = 'Welcome, ' + AppState.currentUser.name + '!';
        if (profileNameInput) profileNameInput.value = AppState.currentUser.name;
        if (profileEmail) profileEmail.value = AppState.currentUser.email;
    }
    
    // Load saved profile data
    const savedProfile = getFromLocalStorage('userProfile');
    if (savedProfile) {
        document.getElementById('profileAge').value = savedProfile.age || '';
        document.getElementById('profileGender').value = savedProfile.gender || '';
        document.getElementById('profileHeight').value = savedProfile.height || '';
        document.getElementById('profileWeight').value = savedProfile.weight || '';
        document.getElementById('profileActivity').value = savedProfile.activity || '';
    }
}

function saveProfile() {
    if (!AppState.isAuthenticated) {
        showAlert('Please login to save your profile.', 'error');
        return;
    }
    
    const profileData = {
        name: document.getElementById('profileNameInput').value,
        email: document.getElementById('profileEmail').value,
        age: parseInt(document.getElementById('profileAge').value),
        gender: document.getElementById('profileGender').value,
        height: parseFloat(document.getElementById('profileHeight').value),
        weight: parseFloat(document.getElementById('profileWeight').value),
        activity: document.getElementById('profileActivity').value
    };
    
    // Update current user
    AppState.currentUser.name = profileData.name;
    AppState.currentUser.email = profileData.email;
    saveToLocalStorage('currentUser', AppState.currentUser);
    
    // Save profile data
    AppState.userProfile = profileData;
    saveToLocalStorage('userProfile', profileData);
    
    // Update header
    document.getElementById('username').textContent = profileData.name;
    
    showAlert('✅ Profile saved successfully!', 'success');
}

function saveGoals() {
    const goals = {
        calorieGoal: parseInt(document.getElementById('calorieGoal').value) || 2000,
        weightGoal: parseFloat(document.getElementById('weightGoal').value) || 70,
        waterGoal: parseFloat(document.getElementById('waterGoal').value) || 2.5,
        dietaryRestrictions: Array.from(document.getElementById('dietaryRestrictions').selectedOptions).map(option => option.value)
    };
    
    AppState.goals = goals;
    saveToLocalStorage('userGoals', goals);
    
    showAlert('🎯 Goals saved successfully!', 'success');
}

// Enhanced section switching function
function showSection(sectionName) {
    switchTab(sectionName);
}

// Enhanced Dashboard Functions
function openFoodLookup() {
    switchTab('meals');
    setTimeout(() => {
        const foodInput = document.getElementById('foodLookup');
        if (foodInput) {
            foodInput.focus();
        }
    }, 300);
}

function logQuickMeal() {
    if (!AppState.isAuthenticated) {
        showAlert('Please login to log meals!', 'info');
        openLoginModal();
        return;
    }
    
    const mealOptions = [
        { name: 'Healthy Breakfast', calories: 350 },
        { name: 'Nutritious Lunch', calories: 450 },
        { name: 'Light Snack', calories: 150 },
        { name: 'Balanced Dinner', calories: 550 }
    ];
    
    const selectedMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
    
    // Update dashboard stats
    const currentStats = getFromLocalStorage('todayStats') || {
        calories: 1250, water: '1.5L', meals: 3
    };
    currentStats.calories += selectedMeal.calories;
    currentStats.meals += 1;
    saveToLocalStorage('todayStats', currentStats);
    updateDashboardStats();
    
    showAlert(`🍽️ Logged ${selectedMeal.name} (${selectedMeal.calories} calories)`, 'success');
}

function createDailyProgressChart() {
    const ctx = document.getElementById('dailyProgressChart');
    if (!ctx) return;
    
    // Enhanced progress chart with macros
    const chartData = {
        labels: ['Calories', 'Protein', 'Carbs', 'Fat', 'Water'],
        datasets: [{
            label: 'Progress',
            data: [62, 75, 58, 45, 75], // Percentages
            backgroundColor: [
                'rgba(231, 76, 60, 0.8)',   // Calories
                'rgba(155, 89, 182, 0.8)',  // Protein
                'rgba(52, 152, 219, 0.8)',  // Carbs
                'rgba(241, 196, 15, 0.8)',  // Fat
                'rgba(26, 188, 156, 0.8)'   // Water
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Daily Macro Progress'
                }
            }
        }
    });
}

function updateHealthScore() {
    // Calculate health score based on various factors
    const currentStats = getFromLocalStorage('todayStats') || {};
    const nutritionResults = getFromLocalStorage('nutritionResults') || {};
    
    let score = 85; // Base score
    
    // Adjust based on goals completion
    const caloriesPercent = (currentStats.calories || 1250) / (nutritionResults.calories || 2000);
    if (caloriesPercent > 0.8 && caloriesPercent < 1.2) score += 5;
    
    const healthScoreEl = document.getElementById('healthScore');
    if (healthScoreEl) {
        healthScoreEl.textContent = Math.max(0, Math.min(100, score));
    }
}

// Tab functionality for profile modal
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        // Profile tab switching
        const profileTabs = document.querySelectorAll('.profile-tab');
        profileTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-profile-tab');
                
                // Update tab buttons
                profileTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Update tab content
                document.querySelectorAll('.profile-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = document.getElementById('profile' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1));
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
        
        // Initialize dashboard charts
        createDailyProgressChart();
        updateHealthScore();
    }, 500);
});

// ===== ADVANCED FUNCTIONALITY FEATURES =====

// Daily AI Coach System
function initializeDailyCoach() {
    const lastCoachingDate = getFromLocalStorage('lastCoachingDate');
    const today = new Date().toDateString();
    
    if (lastCoachingDate !== today) {
        setTimeout(() => {
            showDailyCoaching();
            saveToLocalStorage('lastCoachingDate', today);
        }, 3000); // Show after 3 seconds
    }
    
    // Setup periodic reminders (every 2 hours)
    setInterval(showSmartReminder, 2 * 60 * 60 * 1000);
}

function showDailyCoaching() {
    if (!AppState.isAuthenticated) return;
    
    const userProfile = getFromLocalStorage('userProfile');
    const nutritionResults = getFromLocalStorage('nutritionResults');
    const todayStats = getFromLocalStorage('todayStats') || { calories: 0, water: '0L', meals: 0 };
    
    const coachingMessages = [
        {
            type: 'morning',
            icon: '🌅',
            title: 'Good Morning, Champion!',
            message: `Ready to conquer today? Your target: ${nutritionResults?.calories || 2000} calories, ${nutritionResults?.protein || 150}g protein, and 2L+ water!`,
            action: 'Start with a protein-rich breakfast!'
        },
        {
            type: 'hydration',
            icon: '💧',
            title: 'Hydration Check!',
            message: `You've had ${todayStats.water} so far. Your body needs consistent hydration for optimal performance.`,
            action: 'Grab a glass of water right now! 🥤'
        },
        {
            type: 'protein',
            icon: '🥩',
            title: 'Protein Power Time!',
            message: `Aim for ${Math.round((nutritionResults?.protein || 150) / 3)}g protein this meal. Your muscles will thank you!`,
            action: 'Try: Greek yogurt, eggs, or lean chicken'
        },
        {
            type: 'motivation',
            icon: '🔥',
            title: 'You\'re Doing Amazing!',
            message: `${todayStats.meals} meals logged, ${todayStats.calories} calories tracked. Every healthy choice matters!`,
            action: 'Keep the momentum going! 💪'
        }
    ];
    
    const randomCoaching = coachingMessages[Math.floor(Math.random() * coachingMessages.length)];
    showCoachingToast(randomCoaching);
}

function showCoachingToast(coaching) {
    const toast = document.createElement('div');
    toast.className = 'coaching-toast';
    toast.innerHTML = `
        <div class="coaching-content">
            <div class="coaching-icon">${coaching.icon}</div>
            <div class="coaching-text">
                <h4>${coaching.title}</h4>
                <p>${coaching.message}</p>
                <small><strong>${coaching.action}</strong></small>
            </div>
            <button class="coaching-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        z-index: 1001;
        max-width: 350px;
        animation: slideInRight 0.5s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => toast.remove(), 500);
        }
    }, 10000);
}

function showSmartReminder() {
    if (!AppState.isAuthenticated) return;
    
    const currentHour = new Date().getHours();
    const todayStats = getFromLocalStorage('todayStats') || { calories: 0, water: '0L', meals: 0 };
    
    let reminder = null;
    
    // Smart reminders based on time and progress
    if (currentHour >= 7 && currentHour <= 10 && todayStats.meals === 0) {
        reminder = {
            icon: '🍳',
            title: 'Breakfast Time!',
            message: 'Start your day with energy! Don\'t skip the most important meal.',
            action: 'Check out our breakfast recipes!'
        };
    } else if (currentHour >= 12 && currentHour <= 14 && todayStats.meals <= 1) {
        reminder = {
            icon: '🥗',
            title: 'Lunch Break!',
            message: 'Time to refuel with a balanced, nutritious meal.',
            action: 'Try our quick lunch ideas!'
        };
    } else if (currentHour >= 18 && currentHour <= 20 && todayStats.meals <= 2) {
        reminder = {
            icon: '🍽️',
            title: 'Dinner Time!',
            message: 'End your day with a satisfying, healthy dinner.',
            action: 'Explore our dinner recipes!'
        };
    } else if (parseInt(todayStats.water.replace('L', '')) < 1.5) {
        reminder = {
            icon: '💧',
            title: 'Hydration Alert!',
            message: 'You\'re behind on your water goal. Stay hydrated!',
            action: 'Drink a glass of water now! 🥤'
        };
    }
    
    if (reminder) {
        showCoachingToast(reminder);
    }
}

// Advanced Meal Planning System
function generatePersonalizedMealPlan() {
    const userProfile = getFromLocalStorage('userProfile');
    const nutritionResults = getFromLocalStorage('nutritionResults');
    const goals = getFromLocalStorage('userGoals');
    
    if (!userProfile || !nutritionResults) {
        showAlert('Please complete your nutrition assessment first!', 'warning');
        switchTab('nutrition');
        return;
    }
    
    showLoading('Creating your personalized meal plan...');
    
    // Calculate meal distribution
    const dailyCalories = nutritionResults.calories;
    const dailyProtein = nutritionResults.protein;
    
    const mealPlan = {
        breakfast: {
            calories: Math.round(dailyCalories * 0.25),
            protein: Math.round(dailyProtein * 0.3),
            suggestions: [
                '🥣 Greek yogurt with berries and granola',
                '🍳 Scrambled eggs with whole grain toast',
                '🥞 Protein pancakes with banana',
                '🥗 Avocado toast with poached egg'
            ]
        },
        lunch: {
            calories: Math.round(dailyCalories * 0.35),
            protein: Math.round(dailyProtein * 0.35),
            suggestions: [
                '🥗 Quinoa bowl with grilled chicken',
                '🐟 Salmon salad with mixed greens',
                '🌮 Turkey and veggie wrap',
                '🍲 Lentil soup with whole grain bread'
            ]
        },
        dinner: {
            calories: Math.round(dailyCalories * 0.30),
            protein: Math.round(dailyProtein * 0.25),
            suggestions: [
                '🍗 Grilled chicken with roasted vegetables',
                '🐟 Baked fish with quinoa and broccoli',
                '🥩 Lean beef stir-fry with brown rice',
                '🍝 Whole wheat pasta with turkey meatballs'
            ]
        },
        snacks: {
            calories: Math.round(dailyCalories * 0.10),
            protein: Math.round(dailyProtein * 0.10),
            suggestions: [
                '🥜 Mixed nuts and fruit',
                '🧀 Greek yogurt with almonds',
                '🍎 Apple slices with almond butter',
                '🥤 Protein smoothie'
            ]
        }
    };
    
    hideLoading();
    displayMealPlan(mealPlan);
    saveToLocalStorage('personalizedMealPlan', mealPlan);
}

function displayMealPlan(mealPlan) {
    const modal = document.createElement('div');
    modal.className = 'meal-plan-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    let html = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 20px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        ">
            <button onclick="this.closest('.meal-plan-modal').remove()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
            ">&times;</button>
            
            <h2 style="text-align: center; color: var(--primary-color); margin-bottom: 2rem;">
                🍽️ Your Personalized Meal Plan
            </h2>
    `;
    
    for (const [mealType, meal] of Object.entries(mealPlan)) {
        html += `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: #f8f9fa; border-radius: 15px;">
                <h3 style="color: var(--primary-color); text-transform: capitalize; margin-bottom: 1rem;">
                    ${mealType} - ${meal.calories} cal, ${meal.protein}g protein
                </h3>
                <div style="display: grid; gap: 0.5rem;">
        `;
        
        meal.suggestions.forEach(suggestion => {
            html += `<div style="padding: 0.5rem; background: white; border-radius: 8px; border-left: 4px solid var(--primary-color);">${suggestion}</div>`;
        });
        
        html += `</div></div>`;
    }
    
    html += `
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="startMealPlanTracking()" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 25px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-right: 1rem;
                ">📊 Start Tracking</button>
                <button onclick="generatePersonalizedMealPlan()" style="
                    background: transparent;
                    color: var(--primary-color);
                    padding: 1rem 2rem;
                    border: 2px solid var(--primary-color);
                    border-radius: 25px;
                    font-size: 1.1rem;
                    cursor: pointer;
                ">🔄 Generate New Plan</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function startMealPlanTracking() {
    document.querySelector('.meal-plan-modal').remove();
    showAlert('🎯 Meal plan tracking activated! I\'ll remind you throughout the day.', 'success');
    saveToLocalStorage('mealPlanActive', true);
}

// Advanced Food Scanner (Simulated)
function openFoodScanner() {
    showAlert('📸 Food Scanner activated! (Simulated feature)', 'info');
    
    // Simulate scanning delay
    showLoading('Analyzing food...');
    
    setTimeout(() => {
        hideLoading();
        
        // Simulate scanned food results
        const scannedFoods = [
            { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
            { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
            { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
            { name: 'Salmon Fillet', calories: 208, protein: 22, carbs: 0, fat: 12 }
        ];
        
        const randomFood = scannedFoods[Math.floor(Math.random() * scannedFoods.length)];
        
        displayNutritionLookup({
            calories: randomFood.calories,
            protein: randomFood.protein,
            carbs: randomFood.carbs,
            fat: randomFood.fat,
            fiber: 2,
            serving_qty: 100,
            serving_unit: 'grams',
            source: 'AI Food Scanner'
        }, randomFood.name);
        
        showAlert(`📸 Scanned: ${randomFood.name}! Nutrition info displayed.`, 'success');
        
        // Switch to meals tab to show results
        switchTab('meals');
        
        // Scroll to results
        setTimeout(() => {
            document.getElementById('nutritionLookupResult').scrollIntoView({ behavior: 'smooth' });
        }, 500);
        
    }, 2000);
}

// Smart Grocery List Generator
function generateSmartGroceryList() {
    const mealPlan = getFromLocalStorage('personalizedMealPlan');
    const goals = getFromLocalStorage('userGoals');
    const dietaryRestrictions = goals?.dietaryRestrictions || [];
    
    if (!mealPlan) {
        generatePersonalizedMealPlan();
        return;
    }
    
    const groceryItems = {
        proteins: [
            'Chicken breast (1kg)',
            'Salmon fillet (500g)',
            'Greek yogurt (750g)',
            'Eggs (12 pack)',
            'Lean ground turkey (500g)'
        ],
        vegetables: [
            'Mixed leafy greens (200g)',
            'Broccoli (300g)',
            'Bell peppers (3 pieces)',
            'Tomatoes (500g)',
            'Carrots (500g)'
        ],
        fruits: [
            'Bananas (6 pieces)',
            'Apples (6 pieces)',
            'Mixed berries (250g)',
            'Avocados (3 pieces)',
            'Oranges (4 pieces)'
        ],
        grains: [
            'Brown rice (1kg)',
            'Quinoa (500g)',
            'Whole grain bread (1 loaf)',
            'Oats (500g)',
            'Whole wheat pasta (500g)'
        ],
        dairy: [
            'Milk (1L)',
            'Low-fat cheese (200g)',
            'Plain Greek yogurt (500g)'
        ],
        pantry: [
            'Olive oil (250ml)',
            'Mixed nuts (200g)',
            'Almond butter (250g)',
            'Honey (250g)',
            'Spices & herbs'
        ]
    };
    
    // Filter based on dietary restrictions
    if (dietaryRestrictions.includes('vegan')) {
        delete groceryItems.dairy;
        groceryItems.proteins = [
            'Tofu (400g)',
            'Lentils (500g)',
            'Chickpeas (2 cans)',
            'Quinoa (500g)',
            'Nuts & seeds mix (300g)'
        ];
    }
    
    if (dietaryRestrictions.includes('gluten-free')) {
        groceryItems.grains = [
            'Brown rice (1kg)',
            'Quinoa (500g)',
            'Gluten-free bread (1 loaf)',
            'Gluten-free oats (500g)'
        ];
    }
    
    displayGroceryList({
        categories: groceryItems,
        estimated_cost: '$55-75 USD'
    }, [
        '🌱 Choose organic when possible',
        '🌍 Buy local and seasonal produce',
        '♻️ Bring reusable bags',
        '📋 Check expiry dates',
        '💰 Compare prices for best deals'
    ]);
}

// Achievement & Badge System
function checkAchievements() {
    const achievements = getFromLocalStorage('achievements') || [];
    const todayStats = getFromLocalStorage('todayStats') || {};
    const streakDays = getFromLocalStorage('streakDays') || 0;
    
    const newAchievements = [];
    
    // Check for various achievements
    if (todayStats.meals >= 3 && !achievements.includes('daily_meals')) {
        newAchievements.push({
            id: 'daily_meals',
            title: 'Meal Master',
            description: 'Logged 3 meals in one day',
            badge: '🍽️',
            points: 50
        });
    }
    
    if (parseInt(todayStats.water?.replace('L', '') || '0') >= 2 && !achievements.includes('hydration_hero')) {
        newAchievements.push({
            id: 'hydration_hero',
            title: 'Hydration Hero',
            description: 'Reached daily water goal',
            badge: '💧',
            points: 30
        });
    }
    
    if (streakDays >= 7 && !achievements.includes('weekly_warrior')) {
        newAchievements.push({
            id: 'weekly_warrior',
            title: 'Weekly Warrior',
            description: '7-day nutrition tracking streak',
            badge: '🔥',
            points: 100
        });
    }
    
    // Award new achievements
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            achievements.push(achievement.id);
            showAchievementToast(achievement);
        });
        
        saveToLocalStorage('achievements', achievements);
        
        // Update points
        const currentPoints = getFromLocalStorage('totalPoints') || 0;
        const newPoints = newAchievements.reduce((sum, ach) => sum + ach.points, 0);
        saveToLocalStorage('totalPoints', currentPoints + newPoints);
    }
}

function showAchievementToast(achievement) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-badge">${achievement.badge}</div>
            <div class="achievement-text">
                <h4>🎉 Achievement Unlocked!</h4>
                <h5>${achievement.title}</h5>
                <p>${achievement.description}</p>
                <small>+${achievement.points} points earned!</small>
            </div>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 1rem;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4);
        z-index: 1001;
        max-width: 320px;
        animation: bounceIn 0.6s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => toast.remove(), 500);
        }
    }, 8000);
}

// Initialize enhanced features
function initializeAdvancedFeatures() {
    initializeDailyCoach();
    
    // Check achievements periodically
    setInterval(checkAchievements, 30000); // Every 30 seconds
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes bounceIn {
            0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
            50% { transform: scale(1.05) rotate(2deg); }
            70% { transform: scale(0.9) rotate(-1deg); }
            100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .coaching-content, .achievement-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
        }
        
        .coaching-icon, .achievement-badge {
            font-size: 2rem;
            flex-shrink: 0;
        }
        
        .coaching-text h4, .achievement-text h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
        }
        
        .coaching-text p, .achievement-text p {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .coaching-close {
            position: absolute;
            top: -5px;
            right: -5px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
        }
    `;
    document.head.appendChild(style);
}

// Add to initialization
function initializeApp() {
    setupTabNavigation();
    setupNutritionForm();
    setupAuthentication();
    initializeDashboard();
    loadUserProfile();
    setupChat();
    setupAdvancedFeatures();
    checkAuthStatus();
    initializeAdvancedFeatures(); // Add this line
    
    console.log('🍎 SmartEats App Initialized - Fighting Hunger & Promoting Health!');
}

// ===== AFRICAN FOODS DATABASE INTEGRATION =====

// Find African food in database
function findAfricanFood(searchTerm) {
    const search = searchTerm.toLowerCase();
    
    // Check if African foods database is loaded
    if (typeof window.africanFoodDatabase === 'undefined') {
        console.log('African foods database not loaded');
        return null;
    }
    
    const { ethiopian, african, beverages, spices } = window.africanFoodDatabase;
    
    // Search in all categories
    const allFoods = { ...ethiopian, ...african, ...beverages, ...spices };
    
    for (const [key, food] of Object.entries(allFoods)) {
        // Check main name
        if (food.name.toLowerCase().includes(search)) {
            return { key, ...food };
        }
        
        // Check if search matches key
        if (key.includes(search) || search.includes(key)) {
            return { key, ...food };
        }
        
        // Check alternative names/keywords
        const keywords = [
            'injera', 'enjera', 'ኢንጀራ',
            'doro', 'wat', 'ዶሮ', 'ወጥ',
            'shiro', 'ሽሮ',
            'kitfo', 'ክትፎ',
            'tibs', 'ጥብስ',
            'jollof',
            'fufu',
            'ugali', 'posho',
            'bobotie',
            'couscous',
            'sukuma', 'wiki',
            'tej', 'ጠጅ',
            'bissap', 'hibiscus',
            'berbere', 'በርበሬ',
            'harissa'
        ];
        
        for (const keyword of keywords) {
            if (search.includes(keyword) || keyword.includes(search)) {
                return { key, ...food };
            }
        }
    }
    
    return null;
}

// Display African food information
function displayAfricanFoodInfo(food, searchTerm) {
    const resultDiv = document.getElementById('nutritionLookupResult');
    if (!resultDiv) return;
    
    // Generate comprehensive display
    let html = `
        <div class="african-food-card" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            margin-bottom: 1rem;
        ">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <img src="${food.image}" alt="${food.name}" style="
                    width: 200px;
                    height: 150px;
                    border-radius: 15px;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                ">
                <h3 style="margin: 0; font-size: 1.8rem;">${food.name}</h3>
                <p style="opacity: 0.9; margin: 0.5rem 0;">${food.description}</p>
                <span style="
                    background: rgba(255,255,255,0.2);
                    padding: 0.3rem 1rem;
                    border-radius: 15px;
                    font-size: 0.9rem;
                ">${food.region || 'Traditional African'}</span>
            </div>
        </div>
        
        <div class="nutrition-info-comprehensive" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin: 1.5rem 0;
        ">
    `;
    
    // Nutrition Facts Card
    if (food.calories) {
        html += `
            <div class="nutrition-card" style="
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 15px;
                border-left: 5px solid #16a085;
            ">
                <h4 style="color: #16a085; margin: 0 0 1rem 0;">🥗 Nutrition Facts</h4>
                <div style="display: grid; gap: 0.8rem;">
                    <div class="nutrition-item"><strong>Calories:</strong> ${food.calories}</div>
                    ${food.protein ? `<div class="nutrition-item"><strong>Protein:</strong> ${food.protein}g</div>` : ''}
                    ${food.carbs ? `<div class="nutrition-item"><strong>Carbs:</strong> ${food.carbs}g</div>` : ''}
                    ${food.fat ? `<div class="nutrition-item"><strong>Fat:</strong> ${food.fat}g</div>` : ''}
                    ${food.fiber ? `<div class="nutrition-item"><strong>Fiber:</strong> ${food.fiber}g</div>` : ''}
                </div>
                ${food.servingSize ? `<p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">Per ${food.servingSize}</p>` : ''}
            </div>
        `;
    }
    
    // Health Benefits Card
    if (food.benefits && food.benefits.length > 0) {
        html += `
            <div class="benefits-card" style="
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 15px;
                border-left: 5px solid #e74c3c;
            ">
                <h4 style="color: #e74c3c; margin: 0 0 1rem 0;">💪 Health Benefits</h4>
                <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.6;">
        `;
        food.benefits.forEach(benefit => {
            html += `<li>${benefit}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // Vitamins & Minerals Card
    if (food.vitamins && food.vitamins.length > 0) {
        html += `
            <div class="vitamins-card" style="
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 15px;
                border-left: 5px solid #f39c12;
            ">
                <h4 style="color: #f39c12; margin: 0 0 1rem 0;">🌈 Key Nutrients</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        `;
        food.vitamins.forEach(vitamin => {
            html += `<span style="
                background: rgba(243, 156, 18, 0.1);
                color: #f39c12;
                padding: 0.3rem 0.8rem;
                border-radius: 12px;
                font-size: 0.9rem;
                border: 1px solid rgba(243, 156, 18, 0.2);
            ">${vitamin}</span>`;
        });
        html += `</div></div>`;
    }
    
    // Cultural Information Card
    if (food.culturalSignificance) {
        html += `
            <div class="cultural-card" style="
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 15px;
                border-left: 5px solid #9b59b6;
            ">
                <h4 style="color: #9b59b6; margin: 0 0 1rem 0;">🌍 Cultural Heritage</h4>
                <p style="margin: 0; line-height: 1.6;">${food.culturalSignificance}</p>
                ${food.preparationTime ? `<p style="margin-top: 1rem; font-weight: bold;">⏱️ Preparation Time: ${food.preparationTime}</p>` : ''}
                ${food.spiceLevel ? `<p style="margin-top: 0.5rem;"><strong>Spice Level:</strong> ${food.spiceLevel}</p>` : ''}
            </div>
        `;
    }
    
    // Ingredients Card (for spices)
    if (food.ingredients && food.ingredients.length > 0) {
        html += `
            <div class="ingredients-card" style="
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 15px;
                border-left: 5px solid #27ae60;
                grid-column: 1 / -1;
            ">
                <h4 style="color: #27ae60; margin: 0 0 1rem 0;">🌿 Key Ingredients</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        `;
        food.ingredients.forEach(ingredient => {
            html += `<span style="
                background: rgba(39, 174, 96, 0.1);
                color: #27ae60;
                padding: 0.4rem 1rem;
                border-radius: 15px;
                font-size: 0.9rem;
                border: 1px solid rgba(39, 174, 96, 0.2);
            ">${ingredient}</span>`;
        });
        html += `</div></div>`;
    }
    
    html += `</div>`; // Close nutrition-info-comprehensive
    
    // Special notes
    if (food.dietaryNote || food.note || food.alcoholContent) {
        html += `<div class="dietary-notes" style="
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
        ">`;
        
        if (food.dietaryNote) {
            html += `<p style="margin: 0; color: #856404;"><strong>⚠️ Note:</strong> ${food.dietaryNote}</p>`;
        }
        
        if (food.alcoholContent) {
            html += `<p style="margin: 0; color: #856404;"><strong>🍷 Alcohol Content:</strong> ${food.alcoholContent}</p>`;
        }
        
        if (food.note) {
            html += `<p style="margin: 0; color: #856404;"><strong>ℹ️ Important:</strong> ${food.note}</p>`;
        }
        
        html += `</div>`;
    }
    
    // AI Assistant Response
    if (typeof window.africanFoodResponses !== 'undefined' && window.africanFoodResponses[food.key]) {
        html += `
            <div class="ai-response" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1.5rem;
                border-radius: 15px;
                margin: 1.5rem 0;
            ">
                <h4 style="margin: 0 0 1rem 0;">🤖 SmartEats AI Insights</h4>
                <div style="white-space: pre-line; line-height: 1.6;">${window.africanFoodResponses[food.key]}</div>
            </div>
        `;
    }
    
    // Action Buttons
    html += `
        <div class="action-buttons" style="
            display: flex;
            gap: 1rem;
            margin: 1.5rem 0;
            flex-wrap: wrap;
        ">
            <button onclick="logAfricanMeal('${food.key}', '${food.name}', ${food.calories || 250})" style="
                background: #16a085;
                color: white;
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
            ">🍽️ Log This Meal</button>
            
            <button onclick="shareAfricanFood('${food.name}', '${food.region}')" style="
                background: #3498db;
                color: white;
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
            ">📤 Share Discovery</button>
            
            <button onclick="exploreMoreAfricanFoods('${food.region}')" style="
                background: #e74c3c;
                color: white;
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
            ">🌍 Explore More</button>
        </div>
    `;
    
    // Source attribution
    html += `
        <div class="source-info" style="
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
            font-size: 0.9rem;
            color: #6c757d;
        ">
            <p style="margin: 0;">🌍 <strong>Source:</strong> SmartEats Traditional African Foods Database</p>
            <p style="margin: 0.5rem 0 0 0;">Supporting cultural food diversity for SDG 2 (Zero Hunger) & SDG 3 (Good Health)</p>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
    
    // Show success message
    showAlert(`🌍 Found traditional ${food.region || 'African'} food: ${food.name}!`, 'success');
}

// Log African meal
function logAfricanMeal(foodKey, foodName, calories) {
    if (!AppState.isAuthenticated) {
        showAlert('Please login to log meals!', 'info');
        openLoginModal();
        return;
    }
    
    // Update dashboard stats
    const currentStats = getFromLocalStorage('todayStats') || {
        calories: 1250, water: '1.5L', meals: 3
    };
    currentStats.calories += calories;
    currentStats.meals += 1;
    saveToLocalStorage('todayStats', currentStats);
    updateDashboardStats();
    
    // Track cultural food exploration
    const culturalFoods = getFromLocalStorage('culturalFoodsLogged') || [];
    if (!culturalFoods.includes(foodKey)) {
        culturalFoods.push(foodKey);
        saveToLocalStorage('culturalFoodsLogged', culturalFoods);
        
        // Achievement for cultural exploration
        if (culturalFoods.length >= 5) {
            showAchievementToast({
                id: 'cultural_explorer',
                title: 'Cultural Explorer',
                description: 'Logged 5 different traditional African foods',
                badge: '🌍',
                points: 100
            });
        }
    }
    
    showAlert(`🍽️ Logged ${foodName} (${calories} calories) - Celebrating African food culture! 🌍`, 'success');
}

// Share African food discovery
function shareAfricanFood(foodName, region) {
    const message = `🌍 Just discovered ${foodName} from ${region} on SmartEats! Learning about traditional African foods and their amazing health benefits. #SmartEats #AfricanFood #CulturalNutrition #SDG2 #SDG3`;
    
    if (navigator.share) {
        navigator.share({
            title: 'African Food Discovery - SmartEats',
            text: message,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            showAlert('🌍 Food discovery copied to clipboard! Share your cultural food journey!', 'success');
        }).catch(() => {
            showAlert('🌍 Share this amazing African food discovery with friends!', 'info');
        });
    }
}

// Explore more African foods by region
function exploreMoreAfricanFoods(region) {
    const suggestions = {
        'Ethiopia': ['Try injera with doro wat', 'Explore shiro for plant-based nutrition', 'Discover kitfo - Ethiopian steak tartare'],
        'West Africa': ['Discover jollof rice variations', 'Try fufu with different soups', 'Explore plantain-based dishes'],
        'East Africa': ['Try ugali with sukuma wiki', 'Explore berbere spice blends', 'Discover sorghum dishes'],
        'North Africa': ['Explore couscous variations', 'Try harissa spice paste', 'Discover tagine cooking'],
        'South Africa': ['Try bobotie', 'Explore biltong', 'Discover rooibos tea'],
        'Central Africa': ['Explore cassava dishes', 'Try groundnut stews', 'Discover palm oil cuisine']
    };
    
    const regionSuggestions = suggestions[region] || [
        'Explore injera and doro wat from Ethiopia',
        'Try jollof rice from West Africa',
        'Discover couscous from North Africa',
        'Explore ugali from East Africa'
    ];
    
    let html = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
        ">
            <h3 style="margin: 0 0 1rem 0;">🌍 Explore More from ${region}</h3>
            <div style="display: grid; gap: 0.8rem; margin: 1.5rem 0;">
    `;
    
    regionSuggestions.forEach(suggestion => {
        html += `<div style="
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 10px;
            border-left: 4px solid rgba(255,255,255,0.3);
        ">${suggestion}</div>`;
    });
    
    html += `
            </div>
            <p style="opacity: 0.9; margin: 1rem 0;">🎯 Keep exploring traditional foods to earn the "Cultural Ambassador" badge!</p>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 0; border-radius: 20px; max-width: 600px; position: relative; margin: 2rem;">
            <button onclick="this.closest('div').remove()" style="
                position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.1);
                border: none; font-size: 1.5rem; cursor: pointer; border-radius: 50%;
                width: 40px; height: 40px; z-index: 1001;
            ">&times;</button>
            ${html}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) modal.remove();
    }, 10000);
}

// Enhanced local response generation with African food integration
function generateLocalResponseWithAfricanFoods(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for African food mentions - Enhanced with more foods
    const africanFoodKeywords = {
        // Ethiopian Foods
        'injera': "🍞 **INJERA - ETHIOPIAN SUPERFOOD:**\n\n• **Ancient Grain**: Made from teff, one of the world's oldest grains\n• **Probiotics**: Fermentation creates beneficial bacteria for gut health\n• **Gluten-Free**: Perfect for celiac or gluten sensitivity\n• **Complete Nutrition**: High iron, calcium, protein, and fiber (320 cal, 12g protein per serving)\n• **Cultural Heritage**: Sacred bread that unites Ethiopian families\n\n*Try making injera at home - it takes 3-4 days to ferment properly!*",
        
        'enjera': "🍞 **INJERA - ETHIOPIAN SUPERFOOD:**\n\n• **Ancient Grain**: Made from teff, one of the world's oldest grains\n• **Probiotics**: Fermentation creates beneficial bacteria for gut health\n• **Gluten-Free**: Perfect for celiac or gluten sensitivity\n• **Complete Nutrition**: High iron, calcium, protein, and fiber (320 cal, 12g protein per serving)\n• **Cultural Heritage**: Sacred bread that unites Ethiopian families\n\n*Try making injera at home - it takes 3-4 days to ferment properly!*",
        
        'doro wat': "🍗 **DORO WAT - ETHIOPIA'S NATIONAL DISH:**\n\n• **Protein Power**: 35g high-quality protein per serving (650 calories)\n• **Berbere Benefits**: Anti-inflammatory spices boost immunity\n• **B12 Rich**: Essential vitamin for nerve function\n• **Iron Source**: Supports healthy blood formation\n• **Cultural Pride**: Served at holidays and celebrations\n\n*Best enjoyed with injera and eaten with hands in Ethiopian tradition!*",
        
        'shiro': "🥜 **SHIRO - PLANT-BASED PROTEIN:**\n\n• **Fasting Food**: Perfect for Ethiopian Orthodox fasting periods\n• **Complete Protein**: 18.5g plant-based protein per cup (280 calories)\n• **High Fiber**: 12.4g supports digestive health\n• **Folate Rich**: Essential for pregnant women\n• **Budget Friendly**: Nutritious and affordable meal\n\n*Mix with berbere spice for authentic Ethiopian flavor!*",
        
        'kitfo': "🥩 **KITFO - ETHIOPIAN DELICACY:**\n\n• **High Protein**: 28g premium protein (420 calories per serving)\n• **Iron Rich**: Supports blood health and energy levels\n• **B-Vitamins**: Essential for metabolism and brain function\n• **Cultural Tradition**: Special occasion dish requiring quality meat\n• **Berbere Spice**: Anti-inflammatory and digestive benefits\n\n*Always ensure highest quality meat from trusted sources!*",
        
        'tibs': "🔥 **TIBS - ETHIOPIAN STIR-FRY:**\n\n• **Lean Protein**: 25-30g high-quality protein (380-450 calories)\n• **Quick Cooking**: Retains maximum nutrients\n• **Vegetable Rich**: Bell peppers, onions add vitamins\n• **Healthy Fats**: Cooked in minimal oil\n• **Cultural Favorite**: Popular everyday Ethiopian meal\n\n*Perfect balance of protein and vegetables for a healthy meal!*",
        
        // West African Foods
        'jollof rice': "🍚 **JOLLOF RICE - WEST AFRICAN UNITY:**\n\n• **Cultural Bridge**: Unites Nigeria, Ghana, and Senegal\n• **Balanced Meal**: Perfect carbs, protein, and vegetables (380 calories)\n• **Lycopene Power**: Tomatoes provide antioxidant protection\n• **Energy Source**: Complex carbs for sustained energy\n• **Celebration Food**: Center of West African gatherings\n\n*Each country has their unique jollof recipe - all delicious!*",
        
        'fufu': "🥔 **FUFU - AFRICAN ENERGY SOURCE:**\n\n• **Sustained Energy**: Complex carbs provide lasting fuel (340 calories)\n• **Gluten-Free**: Made from cassava, yam, or plantain\n• **Resistant Starch**: Feeds beneficial gut bacteria\n• **Community Food**: Eaten from shared bowl with family\n• **Versatile**: Pairs with any soup or stew\n\n*Traditionally eaten with hands - it's part of the cultural experience!*",
        
        // East African Foods
        'ugali': "🌽 **UGALI - EAST AFRICAN STAPLE:**\n\n• **Energy Source**: 220 calories of sustained carbohydrate energy\n• **Gluten-Free**: Made from maize/corn flour\n• **Filling**: High satiety index keeps you full longer\n• **Cultural Unity**: Staple across Kenya, Tanzania, Uganda\n• **Budget Friendly**: Affordable nutrition for families\n\n*Perfect with sukuma wiki (collard greens) for complete nutrition!*",
        
        'sukuma wiki': "🥬 **SUKUMA WIKI - NUTRITIONAL POWERHOUSE:**\n\n• **Vitamin K**: Essential for bone health and blood clotting\n• **Iron Rich**: Prevents anemia and boosts energy (45 calories)\n• **Calcium Source**: Supports strong bones and teeth\n• **Low Calorie**: High nutrition density, perfect for weight management\n• **Cultural Wisdom**: \"Sukuma wiki\" means \"stretch the week\"\n\n*Sauté with onions and tomatoes for maximum flavor and nutrition!*",
        
        // North African Foods
        'couscous': "🥣 **COUSCOUS - NORTH AFRICAN COMFORT:**\n\n• **Quick Energy**: Fast-digesting carbs for immediate fuel (176 calories)\n• **B Vitamins**: Supports energy metabolism\n• **Versatile Grain**: Pairs with vegetables, meats, or fruits\n• **Cultural Heritage**: Centuries-old Berber tradition\n• **Light & Fluffy**: Easy on the digestive system\n\n*Steam properly for fluffy texture - never boil couscous!*",
        
        // South African Foods
        'bobotie': "🍖 **BOBOTIE - SOUTH AFRICAN COMFORT:**\n\n• **Protein Rich**: 22g protein from minced meat (320 calories)\n• **Unique Spices**: Curry and dried fruit blend\n• **Cultural Fusion**: Cape Malay and Dutch influences\n• **Complete Meal**: Meat, vegetables, and grains combined\n• **National Dish**: Symbol of South African unity\n\n*The sweet-savory balance makes it uniquely South African!*",
        
        // Traditional Beverages
        'tej': "🍯 **TEJ - ETHIOPIAN HONEY WINE:**\n\n• **Probiotic Benefits**: Fermented honey supports gut health\n• **Antioxidants**: Honey provides natural antioxidants\n• **Cultural Ceremony**: Sacred drink for special occasions\n• **Alcohol Content**: 7-11% - enjoy responsibly\n• **Ancient Recipe**: Thousands of years of tradition\n\n*⚠️ Contains alcohol - not suitable for children or pregnant women*",
        
        'bissap': "🌺 **BISSAP - HIBISCUS SUPERFOOD:**\n\n• **Vitamin C**: Higher than orange juice (15 calories)\n• **Blood Pressure**: Natural compounds help reduce hypertension\n• **Antioxidants**: Deep red color indicates high anthocyanins\n• **Refreshing**: Perfect for hot climates, naturally caffeine-free\n• **Weight Management**: May boost metabolism naturally\n\n*Enjoy hot or cold - both ways are traditionally prepared!*",
        
        'rooibos': "🍃 **ROOIBOS - SOUTH AFRICAN WELLNESS:**\n\n• **Caffeine-Free**: Perfect evening drink (2 calories)\n• **Antioxidants**: Unique aspalathin compound\n• **Mineral Rich**: Natural source of calcium, iron, manganese\n• **Hypoallergenic**: Safe for sensitive individuals\n• **Cultural Pride**: Indigenous to South African Cederberg\n\n*Red bush tea that's naturally sweet - no sugar needed!*",
        
        // Spice Blends
        'berbere': "🌶️ **BERBERE - ETHIOPIAN SPICE MEDICINE:**\n\n• **Anti-Inflammatory**: Turmeric and ginger compounds\n• **Metabolism Boost**: Capsaicin from chili peppers\n• **Antioxidant Rich**: Multiple spices provide diverse compounds\n• **Digestive Aid**: Cardamom and cinnamon support digestion\n• **Cultural Soul**: The heart of Ethiopian cuisine\n\n*Mix into stews, meats, or vegetables for authentic Ethiopian flavor!*",
        
        'harissa': "🔥 **HARISSA - NORTH AFRICAN FIRE:**\n\n• **Capsaicin Power**: Boosts metabolism and pain relief\n• **Vitamin C**: Red peppers provide immune support\n• **Heart Health**: Garlic supports cardiovascular function\n• **Preservative**: Natural antimicrobial properties\n• **Cultural Heritage**: Tunisian origin, now across North Africa\n\n*Start with small amounts - builds heat tolerance over time!*",
        
        // General African Food Wisdom
        'african food': "🌍 **DISCOVER AFRICAN FOOD WISDOM:**\n\n• **Ancient Grains**: Teff, sorghum, millet - nutrient powerhouses\n• **Plant Diversity**: Unique vegetables and legumes\n• **Spice Medicine**: Anti-inflammatory berbere, harissa\n• **Fermented Foods**: Natural probiotics in injera, tej\n• **Cultural Heritage**: Food as medicine and community\n• **Sustainable**: Traditional methods support environment\n\n*Use our food lookup to explore traditional African foods database!*",
        
        'traditional african': "🏺 **TRADITIONAL AFRICAN NUTRITION:**\n\n• **Whole Foods**: Minimal processing, maximum nutrition\n• **Plant Forward**: Vegetables, grains, legumes as foundations\n• **Spice Pharmacy**: Each spice blend has health benefits\n• **Community Eating**: Shared meals strengthen social bonds\n• **Seasonal Wisdom**: Eating with natural rhythms\n• **Food as Medicine**: Traditional knowledge of healing foods\n\n*Our African foods database celebrates this nutritional wisdom!*",
        
        'ethiopian food': "🇪🇹 **ETHIOPIAN FOOD CULTURE:**\n\n• **Coffee Origin**: Ethiopia is the birthplace of coffee\n• **Injera Base**: Fermented teff bread with every meal\n• **Spice Complexity**: Berbere and mitmita spice blends\n• **Fasting Foods**: Rich vegetarian tradition\n• **Hand Eating**: Cultural practice of eating with hands\n• **Coffee Ceremony**: Social bonding through coffee ritual\n\n*Try our Ethiopian food lookup for authentic nutrition info!*"
    };
    
    // Check for African food keywords with fuzzy matching
    for (const [keyword, response] of Object.entries(africanFoodKeywords)) {
        if (lowerMessage.includes(keyword) || 
            lowerMessage.includes(keyword.replace(' ', '')) ||
            keyword.includes(lowerMessage.split(' ')[0])) {
            return response;
        }
    }
    
    // Check for Amharic terms (Ethiopian language)
    if (lowerMessage.includes('ኢንጀራ') || lowerMessage.includes('injera')) {
        return africanFoodKeywords['injera'];
    }
    if (lowerMessage.includes('ዶሮ') || lowerMessage.includes('ወጥ') || lowerMessage.includes('doro wat')) {
        return africanFoodKeywords['doro wat'];
    }
    if (lowerMessage.includes('በርበሬ') || lowerMessage.includes('berbere')) {
        return africanFoodKeywords['berbere'];
    }
    
    // Return null if no African food matches
    return null;
}

// Welcome message
console.log('%c🍎 SmartEats - Hackathon 2025', 'color: #16a085; font-size: 20px; font-weight: bold;');
console.log('%c🌍 Fighting Hunger (SDG 2) & Promoting Health (SDG 3)', 'color: #27ae60; font-size: 14px;');
console.log('%c🛠️ Tech Stack: HTML5 + CSS3 + JS + Python Flask + MySQL/MongoDB/Firebase', 'color: #3498db; font-size: 12px;');
console.log('%c✨ Advanced Features: AI, Community, Wellness, Sustainability + Authentication', 'color: #9b59b6; font-size: 12px;');
console.log('%c🤖 NEW: Advanced AI Coach, Smart Notifications, Meal Planning & Achievements!', 'color: #e74c3c; font-size: 14px; font-weight: bold;');
console.log('%c🌍 NEW: Traditional African Foods Database - Cultural Nutrition Diversity!', 'color: #f39c12; font-size: 14px; font-weight: bold;');
