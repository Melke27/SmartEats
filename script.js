/**
 * SmartEats - Enhanced Frontend JavaScript
 * Hackathon 2025 - SDG 2 & SDG 3 Solution
 * Frontend: HTML5 + CSS3 + JavaScript
 * Backend: Python Flask API
 * Advanced Features: AI, Community, Wellness, Sustainability
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global State Management
const AppState = {
    currentTab: 'dashboard',
    userProfile: null,
    nutritionResults: null,
    progressChart: null,
    meals: [],
    chatHistory: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupNutritionForm();
    initializeDashboard();
    loadUserProfile();
    setupChat();
    setupAdvancedFeatures();
    
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
        const response = await fetch(`${API_BASE_URL}/nutrition/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const results = await response.json();
            displayNutritionResults(results.results);
            AppState.nutritionResults = results.results;
            AppState.userProfile = formData;
            saveToLocalStorage('userProfile', formData);
            saveToLocalStorage('nutritionResults', results.results);
        } else {
            throw new Error('Failed to calculate nutrition needs');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const results = calculateNutritionClientSide(formData);
        displayNutritionResults(results);
        AppState.nutritionResults = results;
        AppState.userProfile = formData;
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
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
        },
        {
            id: 'fish-rice',
            name: 'Baked Salmon & Brown Rice',
            description: 'Omega-3 rich salmon with fiber-packed brown rice',
            calories: 380,
            protein: 28,
            prepTime: 30,
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop'
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

function generateLocalResponse(message) {
    const responses = {
        protein: "For optimal health, aim for 0.8-2.2g of protein per kg of body weight daily. Good sources include lean meats, fish, eggs, legumes, and dairy products. 🥩",
        water: "Drink at least 8 glasses (2L) of water daily. Your needs may increase with exercise or hot weather. Proper hydration supports metabolism! 💧",
        weight: "Healthy weight loss is 0.5-1kg per week. Focus on a balanced diet with moderate calorie deficit and regular exercise. ⚖️",
        calories: "Daily calorie needs depend on age, gender, weight, height, and activity level. Use our nutrition calculator! 🔥",
        vegetables: "Aim for 5-9 servings of fruits and vegetables daily. They provide essential vitamins, minerals, and fiber. Eat the rainbow! 🥬🥕",
        exercise: "Combine 150 minutes of moderate cardio weekly with 2-3 strength training sessions. Exercise boosts metabolism! 💪",
        default: "I'm here to help with nutrition questions! Ask me about calories, protein, healthy recipes, weight management, or wellness tips. 🍎"
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (key !== 'default' && lowerMessage.includes(key)) {
            return response;
        }
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

// Enhanced Food Nutrition Lookup
async function lookupFoodNutrition() {
    const food = document.getElementById('foodLookup').value.trim();
    
    if (!food) {
        showAlert('Please enter a food name to look up nutrition information.', 'warning');
        return;
    }
    
    showLoading('Looking up nutrition information...');
    
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

// Welcome message
console.log('%c🍎 SmartEats - Hackathon 2025', 'color: #16a085; font-size: 20px; font-weight: bold;');
console.log('%c🌍 Fighting Hunger (SDG 2) & Promoting Health (SDG 3)', 'color: #27ae60; font-size: 14px;');
console.log('%c🛠️ Tech Stack: HTML5 + CSS3 + JS + Python Flask + MySQL/MongoDB/Firebase', 'color: #3498db; font-size: 12px;');
console.log('%c✨ Advanced Features: AI, Community, Wellness, Sustainability', 'color: #9b59b6; font-size: 12px;');
