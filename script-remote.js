/**
 * SmartEats - Frontend JavaScript with Remote API
 * Updated to use deployed backend API
 */

// API Configuration - UPDATE THIS WITH YOUR DEPLOYED URL
const API_BASE_URL = 'https://your-app-name.onrender.com';  // Replace with your deployed URL

// Alternative deployment URLs:
// Render: https://your-app-name.onrender.com
// Railway: https://your-app-name.up.railway.app  
// Heroku: https://your-app-name.herokuapp.com

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
    mealLogs: [],
    apiUrl: API_BASE_URL
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    testAPIConnection();
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
    
    console.log('🍎 SmartEats App Initialized with Remote API!');
    console.log('🔗 API URL:', API_BASE_URL);
}

// Test API Connection
async function testAPIConnection() {
    try {
        showLoading('Testing API connection...');
        
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Connection successful:', data);
            showAlert('Connected to remote API successfully! 🚀', 'success');
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ API connection failed, using fallback mode:', error);
        showAlert('Using offline mode - some features limited', 'warning');
        // Keep existing fallback functionality
    } finally {
        hideLoading();
    }
}

// Tab Navigation System (unchanged)
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

// Enhanced Nutrition Calculator with Remote API
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
        const response = await fetch(`${API_BASE_URL}/api/nutrition/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                displayNutritionResults(data.results);
                AppState.nutritionResults = data.results;
                AppState.userProfile = formData;
                saveToLocalStorage('userProfile', formData);
                saveToLocalStorage('nutritionResults', data.results);
                
                // Show recommendations if available
                if (data.recommendations) {
                    showNutritionRecommendations(data.recommendations);
                }
                
                showAlert('✅ Nutrition plan calculated successfully!', 'success');
            } else {
                throw new Error(data.error || 'Calculation failed');
            }
        } else {
            throw new Error(`API error: ${response.status}`);
        }
    } catch (error) {
        console.error('Remote API error:', error);
        showAlert('Using offline calculation mode', 'warning');
        
        // Fallback to client-side calculation
        const results = calculateNutritionClientSide(formData);
        displayNutritionResults(results);
        AppState.nutritionResults = results;
        AppState.userProfile = formData;
        saveToLocalStorage('userProfile', formData);
        saveToLocalStorage('nutritionResults', results);
    }
    
    hideLoading();
}

function showNutritionRecommendations(recommendations) {
    const resultsDiv = document.getElementById('nutritionResults');
    if (!resultsDiv || !recommendations) return;
    
    let recommendationsHtml = '<div class="nutrition-recommendations"><h4>💡 Personalized Recommendations</h4><ul>';
    recommendations.forEach(rec => {
        recommendationsHtml += `<li>${rec}</li>`;
    });
    recommendationsHtml += '</ul></div>';
    
    resultsDiv.innerHTML += recommendationsHtml;
}

// Client-side fallback calculation (unchanged)
function calculateNutritionClientSide(data) {
    const heightInMeters = data.height / 100;
    const bmi = data.weight / (heightInMeters * heightInMeters);
    
    let bmr;
    if (data.gender === 'male') {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
    } else {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    }
    
    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very': 1.725,
        'extra': 1.9
    };
    
    const tdee = bmr * activityMultipliers[data.activity];
    
    const protein = data.weight * 2.2;
    const fat = tdee * 0.25 / 9;
    const carbs = (tdee - (protein * 4) - (fat * 9)) / 4;
    const water = data.weight * 0.035;
    
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
}

// Enhanced Chat System with Remote API
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
    
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    addTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        removeTypingIndicator();
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                addMessageToChat(data.response, 'bot');
                console.log('🤖 Language detected:', data.language);
            } else {
                throw new Error(data.error || 'Chat failed');
            }
        } else {
            throw new Error(`Chat API error: ${response.status}`);
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator();
        
        // Fallback to local responses
        const localResponse = generateLocalResponse(message);
        addMessageToChat(localResponse, 'bot');
        showAlert('Using offline chat mode', 'info');
    }
}

// Enhanced Recipe Search with Remote API
async function searchRecipes() {
    const ingredients = document.getElementById('ingredientSearch').value;
    if (!ingredients.trim()) {
        showAlert('Please enter some ingredients to search for recipes.', 'warning');
        return;
    }
    
    showLoading('Searching for healthy recipes...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: ingredients })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                displayRecipes(data.recipes);
                showAlert(`Found ${data.total_results} recipes! 🍽️`, 'success');
            } else {
                throw new Error(data.error || 'Recipe search failed');
            }
        } else {
            throw new Error(`Recipe API error: ${response.status}`);
        }
    } catch (error) {
        console.error('Recipe search error:', error);
        showAlert('Using local recipe database', 'warning');
        displaySampleRecipes();
    }
    
    hideLoading();
}

// Enhanced Meal Logging with Remote API
async function logMeal(mealId) {
    try {
        showLoading('Logging your meal...');
        
        const response = await fetch(`${API_BASE_URL}/api/meals/log`, {
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
            const data = await response.json();
            if (data.success) {
                showAlert(`✅ Meal logged! +${data.calories_added} calories, +${data.protein_added}g protein`, 'success');
                updateDashboardStats();
            } else {
                throw new Error(data.error || 'Meal logging failed');
            }
        } else {
            throw new Error(`Meal API error: ${response.status}`);
        }
    } catch (error) {
        console.error('Meal logging error:', error);
        
        // Fallback to local logging
        const currentStats = getFromLocalStorage('todayStats') || {
            calories: 1250, water: '1.5L', meals: 3
        };
        currentStats.meals += 1;
        currentStats.calories += Math.floor(Math.random() * 300) + 300;
        saveToLocalStorage('todayStats', currentStats);
        updateDashboardStats();
        showAlert('🍽️ Meal logged locally!', 'success');
    } finally {
        hideLoading();
    }
}

// Enhanced Wellness Tracking with Remote API
async function trackWellness() {
    const sleepHours = parseFloat(document.getElementById('sleepHours').value) || 8;
    const stressLevel = parseInt(document.getElementById('stressLevel').value) || 5;
    
    showLoading('Analyzing your wellness data...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/wellness/sleep-stress`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                sleep_hours: sleepHours,
                stress_level: stressLevel
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                displayWellnessResults(data);
                showAlert(`Wellness Score: ${data.wellness_score}/100 🌟`, 'success');
            } else {
                throw new Error(data.error || 'Wellness tracking failed');
            }
        } else {
            throw new Error(`Wellness API error: ${response.status}`);
        }
    } catch (error) {
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
        showAlert('Using offline wellness analysis', 'warning');
    } finally {
        hideLoading();
    }
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
    
    if (data.tips) {
        html += '<div class="wellness-tips"><h5>💡 Wellness Tips:</h5><ul>';
        data.tips.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        html += '</ul></div>';
    }
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

// Utility Functions
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        document.getElementById('loadingMessage').textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    // Try enhanced notification first
    if (typeof window.showQuickNotif === 'function') {
        window.showQuickNotif(message, type);
        return;
    }
    
    // Fallback to basic alert
    const toast = document.getElementById('toast');
    if (toast) {
        document.getElementById('toastMessage').textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('LocalStorage error:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('LocalStorage error:', error);
        return null;
    }
}

// Initialize remaining functions from original script
function initializeDashboard() {
    createProgressChart();
    updateDashboardStats();
}

function createProgressChart() {
    const ctx = document.getElementById('dailyProgressChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
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
            }
        }
    });
}

function updateDashboardStats() {
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

// Keep all other existing functions from original script...
// (Chat functions, recipe functions, etc. - they're already defined above or in the original script)

console.log('🚀 SmartEats Remote API Script Loaded!');
console.log('📡 Ready to connect to:', API_BASE_URL);
