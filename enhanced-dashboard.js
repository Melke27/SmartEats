/**
 * SmartEats Enhanced Dashboard JavaScript
 * Advanced Analytics, AI Insights, and Comprehensive Tracking
 * SDG 2 & 3 Support - Fighting Hunger & Promoting Health
 */

// Enhanced App State Management
const EnhancedAppState = {
    currentTab: 'analytics',
    charts: {},
    userData: {
        caloriesGoal: 2000,
        proteinGoal: 120,
        hydrationGoal: 2.5,
        activityGoal: 10000
    },
    analytics: {
        weeklyData: [],
        nutritionTrends: [],
        goalsProgress: {}
    },
    insights: {
        recommendations: [],
        predictions: {},
        patterns: {}
    }
};

// Initialize Enhanced Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedDashboard();
});

function initializeEnhancedDashboard() {
    setupEnhancedTabNavigation();
    initializeCharts();
    loadDashboardData();
    setupRealTimeUpdates();
    initializeInsightsPanel();
    setupGoalTracking();
    loadCulturalFoods();
    
    console.log('🚀 Enhanced SmartEats Dashboard Initialized!');
}

// Enhanced Tab Navigation
function setupEnhancedTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchEnhancedTab(targetTab);
        });
    });
}

function switchEnhancedTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    EnhancedAppState.currentTab = tabName;
    
    // Load tab-specific data
    switch(tabName) {
        case 'analytics':
            updateAnalyticsDashboard();
            break;
        case 'insights':
            updateInsightsPanel();
            break;
        case 'planning':
            updateMealPlanningDashboard();
            break;
        case 'goals':
            updateGoalsDashboard();
            break;
        case 'community':
            updateCommunityDashboard();
            break;
        case 'cultural':
            updateCulturalDashboard();
            break;
    }
}

// Dynamic Charts Initialization
function initializeCharts() {
    // KPI Progress Rings
    initializeProgressRings();
    
    // Nutrition Trends Chart
    initializeNutritionTrendsChart();
    
    // Macro Balance Chart
    initializeMacroBalanceChart();
    
    // Analytics Charts
    initializeAnalyticsCharts();
    
    // Forecasting Charts
    initializeForecastingCharts();
    
    console.log('📊 All charts initialized successfully!');
}

// Progress Ring Charts
function initializeProgressRings() {
    const rings = [
        { id: 'caloriesRing', value: 62, color: '#ff6b6b', label: 'Calories' },
        { id: 'proteinRing', value: 74, color: '#4ecdc4', label: 'Protein' },
        { id: 'hydrationRing', value: 84, color: '#45b7d1', label: 'Hydration' },
        { id: 'activityRing', value: 72, color: '#96ceb4', label: 'Activity' }
    ];
    
    rings.forEach(ring => {
        const canvas = document.getElementById(ring.id);
        if (canvas) {
            drawProgressRing(canvas, ring.value, ring.color);
        }
    });
}

function drawProgressRing(canvas, percentage, color) {
    const ctx = canvas.getContext('2d');
    const centerX = 30;
    const centerY = 30;
    const radius = 25;
    
    // Clear canvas
    ctx.clearRect(0, 0, 60, 60);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Progress arc
    const angle = (percentage / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Center text
    ctx.fillStyle = color;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(percentage + '%', centerX, centerY + 3);
}

// Nutrition Trends Chart
function initializeNutritionTrendsChart() {
    const ctx = document.getElementById('nutritionTrendsChart');
    if (!ctx) return;
    
    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Calories',
                data: [1850, 2100, 1950, 2200, 1800, 2300, 1900],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Protein (g)',
                data: [95, 110, 105, 125, 90, 130, 100],
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            },
            {
                label: 'Hydration (L)',
                data: [2.2, 2.8, 2.5, 3.0, 2.1, 2.9, 2.4],
                borderColor: '#45b7d1',
                backgroundColor: 'rgba(69, 183, 209, 0.1)',
                tension: 0.4,
                yAxisID: 'y2'
            }
        ]
    };
    
    EnhancedAppState.charts.nutritionTrends = new Chart(ctx, {
        type: 'line',
        data: weeklyData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Nutrition Tracking'
                },
                legend: {
                    position: 'top'
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Day of Week'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Protein (g)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right'
                }
            }
        }
    });
}

// Macro Balance Pie Chart
function initializeMacroBalanceChart() {
    const ctx = document.getElementById('macroBalanceChart');
    if (!ctx) return;
    
    const macroData = {
        labels: ['Protein', 'Carbohydrates', 'Fats'],
        datasets: [{
            data: [30, 45, 25], // percentages
            backgroundColor: [
                '#4ecdc4',
                '#ffd93d',
                '#ff6b6b'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    EnhancedAppState.charts.macroBalance = new Chart(ctx, {
        type: 'doughnut',
        data: macroData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Today\'s Macro Distribution'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Analytics Charts
function initializeAnalyticsCharts() {
    // Hydration Pattern Chart
    const hydrationCtx = document.getElementById('hydrationPatternChart');
    if (hydrationCtx) {
        const hydrationData = {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
            datasets: [{
                label: 'Water Intake (ml)',
                data: [200, 150, 300, 400, 350, 200],
                borderColor: '#45b7d1',
                backgroundColor: 'rgba(69, 183, 209, 0.2)',
                tension: 0.4,
                fill: true
            }]
        };
        
        EnhancedAppState.charts.hydrationPattern = new Chart(hydrationCtx, {
            type: 'line',
            data: hydrationData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'ml'
                        }
                    }
                }
            }
        });
    }
    
    // Sleep-Nutrition Correlation Chart
    const sleepCtx = document.getElementById('sleepNutritionChart');
    if (sleepCtx) {
        const sleepData = {
            datasets: [{
                label: 'Sleep Quality vs Nutrition Score',
                data: [
                    {x: 6.5, y: 75},
                    {x: 7.0, y: 82},
                    {x: 7.5, y: 90},
                    {x: 8.0, y: 95},
                    {x: 8.5, y: 88},
                    {x: 9.0, y: 80}
                ],
                backgroundColor: 'rgba(150, 206, 180, 0.8)',
                borderColor: '#96ceb4',
                borderWidth: 2
            }]
        };
        
        EnhancedAppState.charts.sleepNutrition = new Chart(sleepCtx, {
            type: 'scatter',
            data: sleepData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Sleep Hours'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Nutrition Score'
                        }
                    }
                }
            }
        });
    }
    
    // Goal Achievement Chart
    const goalCtx = document.getElementById('goalAchievementChart');
    if (goalCtx) {
        const goalData = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Achievement Rate %',
                data: [75, 82, 87, 92],
                borderColor: '#ffd93d',
                backgroundColor: 'rgba(255, 217, 61, 0.2)',
                tension: 0.4,
                fill: true
            }]
        };
        
        EnhancedAppState.charts.goalAchievement = new Chart(goalCtx, {
            type: 'line',
            data: goalData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Achievement %'
                        }
                    }
                }
            }
        });
    }
    
    // Sustainability Chart
    const sustainabilityCtx = document.getElementById('sustainabilityChart');
    if (sustainabilityCtx) {
        const sustainabilityData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Sustainability Score',
                data: [65, 72, 78, 85, 89],
                borderColor: '#96ceb4',
                backgroundColor: 'rgba(150, 206, 180, 0.3)',
                tension: 0.4,
                fill: true
            }]
        };
        
        EnhancedAppState.charts.sustainability = new Chart(sustainabilityCtx, {
            type: 'line',
            data: sustainabilityData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score'
                        }
                    }
                }
            }
        });
    }
}

// Forecasting Charts
function initializeForecastingCharts() {
    // Weekly Forecast Chart
    const forecastCtx = document.getElementById('weeklyForecastChart');
    if (forecastCtx) {
        const forecastData = {
            labels: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Predicted Calories',
                    data: [1950, 2100, 1850, 2000, 1900, 2200, 2050],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                },
                {
                    label: 'Goal',
                    data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
                    borderColor: '#95a5a6',
                    backgroundColor: 'transparent',
                    borderWidth: 1
                }
            ]
        };
        
        EnhancedAppState.charts.weeklyForecast = new Chart(forecastCtx, {
            type: 'line',
            data: forecastData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'AI Prediction Model'
                    }
                }
            }
        });
    }
    
    // Habit Pattern Chart
    const habitCtx = document.getElementById('habitPatternChart');
    if (habitCtx) {
        const habitData = {
            labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Water', 'Exercise'],
            datasets: [{
                label: 'Consistency Score',
                data: [95, 85, 90, 60, 75, 80],
                backgroundColor: [
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(78, 205, 196, 0.8)', 
                    'rgba(255, 217, 61, 0.8)',
                    'rgba(150, 206, 180, 0.8)',
                    'rgba(69, 183, 209, 0.8)',
                    'rgba(155, 89, 182, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };
        
        EnhancedAppState.charts.habitPattern = new Chart(habitCtx, {
            type: 'radar',
            data: habitData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Weekly Nutrition Forecast Chart
function initializeWeeklyNutritionForecast() {
    const ctx = document.getElementById('weeklyNutritionForecast');
    if (!ctx) return;
    
    const forecastData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Calories (predicted)',
                data: [1950, 2100, 1850, 2000, 1900, 2200, 2050],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y'
            },
            {
                label: 'Protein (predicted)',
                data: [110, 125, 95, 115, 105, 135, 120],
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                yAxisID: 'y1'
            }
        ]
    };
    
    EnhancedAppState.charts.weeklyNutritionForecast = new Chart(ctx, {
        type: 'line',
        data: forecastData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'AI-Powered Nutrition Forecasting'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Protein (g)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Cultural Nutrition Chart
function initializeCulturalNutritionChart() {
    const ctx = document.getElementById('culturalNutritionChart');
    if (!ctx) return;
    
    const culturalData = {
        labels: ['Injera', 'Doro Wat', 'Shiro', 'Jollof Rice', 'Fufu'],
        datasets: [
            {
                label: 'Calories per 100g',
                data: [180, 420, 280, 290, 320],
                backgroundColor: 'rgba(255, 107, 107, 0.8)',
                yAxisID: 'y'
            },
            {
                label: 'Protein (g)',
                data: [6.8, 35.2, 18.5, 8.2, 2.8],
                backgroundColor: 'rgba(78, 205, 196, 0.8)',
                yAxisID: 'y1'
            }
        ]
    };
    
    EnhancedAppState.charts.culturalNutrition = new Chart(ctx, {
        type: 'bar',
        data: culturalData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Traditional African Foods Nutrition Comparison'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Protein (g)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Dashboard Data Loading
async function loadDashboardData() {
    try {
        // Load current stats
        await updateKPIValues();
        
        // Load recent activity
        await loadRecentActivity();
        
        // Generate nutrition heatmap
        generateNutritionHeatmap();
        
        showToast('📊 Dashboard data loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('⚠️ Some dashboard features are in demo mode', 'warning');
    }
}

async function updateKPIValues() {
    // Update KPI values with real or simulated data
    const kpiUpdates = [
        { id: 'caloriesKPI', value: '1,247', progress: 62 },
        { id: 'proteinKPI', value: '89g', progress: 74 },
        { id: 'hydrationKPI', value: '2.1L', progress: 84 },
        { id: 'activityKPI', value: '7,234', progress: 72 }
    ];
    
    kpiUpdates.forEach(kpi => {
        const element = document.getElementById(kpi.id);
        if (element) {
            element.textContent = kpi.value;
        }
    });
    
    // Update progress rings
    setTimeout(() => {
        initializeProgressRings();
    }, 500);
}

// Insights Panel Functions
function initializeInsightsPanel() {
    generatePersonalizedRecommendations();
    updatePredictiveAnalytics();
}

function generatePersonalizedRecommendations() {
    const recommendations = [
        {
            type: 'nutrition',
            icon: '⚡',
            title: 'Energy Optimization',
            message: 'Your energy dips around 3 PM. Try a protein-rich snack with almonds or Greek yogurt.',
            action: 'Add to Meal Plan',
            actionFunction: 'addToMealPlan("protein-snack")'
        },
        {
            type: 'hydration',
            icon: '💧',
            title: 'Hydration Reminder',
            message: 'You\'re 300ml behind your hydration goal. Drink water in the next 2 hours.',
            action: 'Log Water Intake',
            actionFunction: 'logWater(300)'
        },
        {
            type: 'cultural',
            icon: '🌍',
            title: 'Cultural Food Spotlight',
            message: 'Try Ethiopian Shiro tonight - high protein, fiber-rich, and perfect for your goals!',
            action: 'Learn More',
            actionFunction: 'exploreCulturalFood("shiro")'
        },
        {
            type: 'sustainability',
            icon: '🌱',
            title: 'Sustainability Boost',
            message: 'Adding one plant-based meal this week will reduce your carbon footprint by 2.3kg CO2.',
            action: 'Find Recipes',
            actionFunction: 'findPlantBasedMeals()'
        }
    ];
    
    EnhancedAppState.insights.recommendations = recommendations;
}

// Nutrition Heatmap Generation
function generateNutritionHeatmap() {
    const heatmapContainer = document.getElementById('nutritionHeatmap');
    if (!heatmapContainer) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const metrics = ['Calories', 'Protein', 'Hydration', 'Sleep'];
    
    // Sample data (in real app, fetch from database)
    const heatmapData = [
        [85, 90, 75, 80, 95, 70, 85], // Calories
        [92, 88, 85, 90, 95, 75, 90], // Protein
        [80, 85, 90, 75, 85, 60, 80], // Hydration
        [90, 85, 80, 88, 92, 70, 85]  // Sleep
    ];
    
    let html = '<div class="heatmap-labels">';
    metrics.forEach(metric => {
        html += `<div class="heatmap-label">${metric}</div>`;
    });
    html += '</div>';
    
    html += '<div class="heatmap-days">';
    days.forEach(day => {
        html += `<div class="heatmap-day-label">${day}</div>`;
    });
    html += '</div>';
    
    html += '<div class="heatmap-cells">';
    heatmapData.forEach((metricData, metricIndex) => {
        metricData.forEach((value, dayIndex) => {
            const intensity = Math.round(value / 20); // 0-5 scale
            html += `<div class="heatmap-cell intensity-${intensity}" title="${metrics[metricIndex]} on ${days[dayIndex]}: ${value}%"></div>`;
        });
    });
    html += '</div>';
    
    heatmapContainer.innerHTML = html;
}

// Meal Planning Functions
function updateMealPlanningDashboard() {
    generateMealCalendar();
    initializeWeeklyNutritionForecast();
    loadRecipeSuggestions();
}

function generateMealCalendar() {
    const calendarContainer = document.getElementById('mealCalendar');
    if (!calendarContainer) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
    
    let html = '<div class="calendar-grid">';
    
    // Header row
    html += '<div class="calendar-header-row">';
    html += '<div class="calendar-cell header">Meal</div>';
    days.forEach(day => {
        html += `<div class="calendar-cell header">${day.slice(0, 3)}</div>`;
    });
    html += '</div>';
    
    // Meal rows
    mealTypes.forEach(mealType => {
        html += '<div class="calendar-meal-row">';
        html += `<div class="calendar-cell meal-type">${mealType}</div>`;
        
        days.forEach((day, dayIndex) => {
            const plannedMeal = getPlannedMeal(mealType, dayIndex);
            html += `<div class="calendar-cell meal-slot" onclick="planMeal('${mealType}', ${dayIndex})">`;
            if (plannedMeal) {
                html += `<div class="planned-meal">${plannedMeal.name}</div>`;
                html += `<div class="meal-calories">${plannedMeal.calories} cal</div>`;
            } else {
                html += '<div class="add-meal">+ Add Meal</div>';
            }
            html += '</div>';
        });
        
        html += '</div>';
    });
    
    html += '</div>';
    calendarContainer.innerHTML = html;
}

function getPlannedMeal(mealType, dayIndex) {
    // Sample planned meals (in real app, fetch from database)
    const plannedMeals = {
        'Breakfast': [
            { name: 'Oatmeal & Berries', calories: 320 },
            { name: 'Avocado Toast', calories: 280 },
            { name: 'Greek Yogurt', calories: 250 },
            { name: 'Injera & Honey', calories: 300 },
            { name: 'Smoothie Bowl', calories: 350 },
            null, // Saturday - not planned
            { name: 'Pancakes', calories: 400 }
        ],
        'Lunch': [
            { name: 'Quinoa Bowl', calories: 420 },
            { name: 'Grilled Chicken', calories: 380 },
            { name: 'Salmon Salad', calories: 350 },
            { name: 'Shiro Wat', calories: 280 },
            { name: 'Veggie Wrap', calories: 320 },
            null, // Saturday
            { name: 'Pasta Primavera', calories: 450 }
        ],
        'Dinner': [
            { name: 'Grilled Fish', calories: 350 },
            { name: 'Doro Wat', calories: 420 },
            { name: 'Lentil Curry', calories: 300 },
            { name: 'Stir Fry', calories: 380 },
            { name: 'Baked Chicken', calories: 340 },
            null, // Saturday
            { name: 'Roast Vegetables', calories: 280 }
        ]
    };
    
    return plannedMeals[mealType] ? plannedMeals[mealType][dayIndex] : null;
}

// Goals Dashboard Functions
function updateGoalsDashboard() {
    loadActiveGoals();
    generateGoalSuggestions();
    updateGoalMetrics();
}

function loadActiveGoals() {
    const goalsContainer = document.getElementById('activeGoals');
    if (!goalsContainer) return;
    
    const activeGoals = [
        {
            id: 'protein-goal',
            title: 'Daily Protein Target',
            current: 89,
            target: 120,
            unit: 'g',
            progress: 74,
            streak: 5,
            color: '#4ecdc4'
        },
        {
            id: 'hydration-goal',
            title: 'Hydration Goal',
            current: 2.1,
            target: 2.5,
            unit: 'L',
            progress: 84,
            streak: 12,
            color: '#45b7d1'
        },
        {
            id: 'veggie-goal',
            title: 'Vegetable Servings',
            current: 4,
            target: 5,
            unit: 'servings',
            progress: 80,
            streak: 3,
            color: '#96ceb4'
        },
        {
            id: 'sustainability-goal',
            title: 'Weekly Plant-Based Meals',
            current: 3,
            target: 5,
            unit: 'meals',
            progress: 60,
            streak: 2,
            color: '#ffd93d'
        }
    ];
    
    let html = '';
    activeGoals.forEach(goal => {
        html += `
            <div class="goal-card" style="border-left: 4px solid ${goal.color}">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <span class="goal-streak">🔥 ${goal.streak} day streak</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-numbers">
                        <span class="goal-current">${goal.current}</span>
                        <span class="goal-separator">/</span>
                        <span class="goal-target">${goal.target} ${goal.unit}</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%; background-color: ${goal.color}"></div>
                    </div>
                    <span class="goal-percentage">${goal.progress}%</span>
                </div>
                <div class="goal-actions">
                    <button class="goal-btn" onclick="updateGoal('${goal.id}')">Update</button>
                    <button class="goal-btn secondary" onclick="viewGoalHistory('${goal.id}')">History</button>
                </div>
            </div>
        `;
    });
    
    goalsContainer.innerHTML = html;
}

function generateGoalSuggestions() {
    const suggestionsContainer = document.getElementById('goalSuggestions');
    if (!suggestionsContainer) return;
    
    const suggestions = [
        {
            title: 'Improve Weekend Hydration',
            description: 'Your weekend hydration drops by 25%. Set reminder for Saturday & Sunday.',
            difficulty: 'Easy',
            impact: 'Medium',
            timeframe: '2 weeks'
        },
        {
            title: 'Try Cultural Foods Weekly',
            description: 'Explore 1 traditional African food per week to diversify nutrition.',
            difficulty: 'Medium',
            impact: 'High',
            timeframe: '4 weeks'
        },
        {
            title: 'Afternoon Energy Boost',
            description: 'Add healthy 3 PM snack to combat energy dips.',
            difficulty: 'Easy',
            impact: 'High',
            timeframe: '1 week'
        }
    ];
    
    let html = '';
    suggestions.forEach((suggestion, index) => {
        html += `
            <div class="suggestion-card">
                <div class="suggestion-header">
                    <h4>${suggestion.title}</h4>
                    <div class="suggestion-badges">
                        <span class="difficulty-badge ${suggestion.difficulty.toLowerCase()}">${suggestion.difficulty}</span>
                        <span class="impact-badge ${suggestion.impact.toLowerCase()}">${suggestion.impact} Impact</span>
                    </div>
                </div>
                <p>${suggestion.description}</p>
                <div class="suggestion-footer">
                    <span class="timeframe">⏱️ ${suggestion.timeframe}</span>
                    <button class="suggestion-btn" onclick="adoptGoal(${index})">🎯 Adopt Goal</button>
                </div>
            </div>
        `;
    });
    
    suggestionsContainer.innerHTML = html;
}

// Cultural Foods Functions
function loadCulturalFoods() {
    updateCulturalDashboard();
}

function updateCulturalDashboard() {
    displayCulturalFoods('all');
    initializeCulturalNutritionChart();
}

function displayCulturalFoods(region = 'all') {
    const container = document.getElementById('culturalFoodsGrid');
    if (!container) return;
    
    // Get foods from african_foods.js
    let foods = [];
    
    if (typeof ethiopianFoods !== 'undefined') {
        foods = [...foods, ...Object.values(ethiopianFoods)];
    }
    
    if (typeof africanFoods !== 'undefined') {
        foods = [...foods, ...Object.values(africanFoods)];
    }
    
    // Filter by region if specified
    if (region !== 'all') {
        foods = foods.filter(food => {
            if (region === 'ethiopian') return food.region === 'Ethiopia';
            if (region === 'west-african') return food.region && food.region.includes('West Africa');
            if (region === 'east-african') return food.region && food.region.includes('East Africa');
            return true;
        });
    }
    
    let html = '';
    foods.forEach(food => {
        html += `
            <div class="cultural-food-card">
                <div class="food-image">
                    <img src="${food.image}" alt="${food.name}" loading="lazy">
                </div>
                <div class="food-content">
                    <h4>${food.name}</h4>
                    <p class="food-description">${food.description}</p>
                    <div class="food-region">📍 ${food.region}</div>
                    <div class="nutrition-quick">
                        <span>🔥 ${food.calories} cal</span>
                        <span>🥩 ${food.protein}g protein</span>
                        <span>🌾 ${food.carbs}g carbs</span>
                    </div>
                    <div class="food-benefits">
                        <h5>Health Benefits:</h5>
                        <ul>
                            ${food.benefits.slice(0, 2).map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="food-actions">
                        <button class="food-btn" onclick="addToMealPlan('${food.name.toLowerCase()}')">Add to Plan</button>
                        <button class="food-btn secondary" onclick="viewNutritionDetails('${food.name}')">Nutrition</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Enhanced Community Functions
function updateCommunityDashboard() {
    loadEnhancedLeaderboard();
    loadTeamChallenges();
}

function loadEnhancedLeaderboard() {
    const leaderboard = document.getElementById('enhancedLeaderboard');
    if (!leaderboard) return;
    
    const sampleLeaderboard = [
        { rank: 1, username: 'EthiopianFoodie', score: 2850, streak: 28, avatar: '🇪🇹', speciality: 'Cultural Foods' },
        { rank: 2, username: 'NutritionNinja', score: 2650, streak: 21, avatar: '🥷', speciality: 'Macro Tracking' },
        { rank: 3, username: 'WellnessWarrior', score: 2480, streak: 18, avatar: '⚔️', speciality: 'Holistic Health' },
        { rank: 4, username: 'PlantPowerChamp', score: 2320, streak: 15, avatar: '🌱', speciality: 'Sustainability' },
        { rank: 5, username: 'FitnessGuru2025', score: 2180, streak: 12, avatar: '💪', speciality: 'Active Lifestyle' }
    ];
    
    let html = '';
    sampleLeaderboard.forEach(user => {
        const badgeIcon = user.rank <= 3 ? ['🏆', '🥈', '🥉'][user.rank - 1] : '⭐';
        html += `
            <div class="leaderboard-item-enhanced">
                <div class="rank-section">
                    <span class="rank-badge">${badgeIcon}</span>
                    <span class="rank-number">#${user.rank}</span>
                </div>
                <div class="user-section">
                    <div class="user-avatar">${user.avatar}</div>
                    <div class="user-info">
                        <span class="username">${user.username}</span>
                        <span class="speciality">${user.speciality}</span>
                    </div>
                </div>
                <div class="stats-section">
                    <div class="user-score">${user.score.toLocaleString()} pts</div>
                    <div class="user-streak">🔥 ${user.streak} days</div>
                </div>
                <button class="follow-btn" onclick="followUser('${user.username}')">Follow</button>
            </div>
        `;
    });
    
    leaderboard.innerHTML = html;
}

function loadTeamChallenges() {
    const challengesContainer = document.getElementById('teamChallenges');
    if (!challengesContainer) return;
    
    const teamChallenges = [
        {
            id: 'global-hydration',
            title: '🌍 Global Hydration Challenge',
            description: 'Join 50,000+ users in drinking more water for better health',
            participants: 52847,
            progress: 78,
            reward: 'Exclusive Water Warrior Badge + 200 points',
            timeLeft: '5 days',
            teamProgress: 'Team SmartEats: 145/200 members participating'
        },
        {
            id: 'cultural-food-week',
            title: '🍽️ Cultural Food Discovery Week',
            description: 'Explore traditional foods from around the world',
            participants: 23451,
            progress: 45,
            reward: 'Cultural Explorer Badge + Recipe Collection',
            timeLeft: '3 days',
            teamProgress: 'Team Africa: 89/150 foods tried'
        }
    ];
    
    let html = '';
    teamChallenges.forEach(challenge => {
        html += `
            <div class="team-challenge-card">
                <div class="challenge-header">
                    <h4>${challenge.title}</h4>
                    <span class="participants-count">👥 ${challenge.participants.toLocaleString()} participants</span>
                </div>
                <p>${challenge.description}</p>
                <div class="challenge-progress">
                    <div class="progress-bar large">
                        <div class="progress-fill" style="width: ${challenge.progress}%"></div>
                    </div>
                    <span class="progress-text">${challenge.progress}% Complete</span>
                </div>
                <div class="team-progress">
                    <p><strong>🏆 ${challenge.teamProgress}</strong></p>
                </div>
                <div class="challenge-footer">
                    <div class="challenge-info">
                        <span class="time-left">⏰ ${challenge.timeLeft} left</span>
                        <span class="reward">🎁 ${challenge.reward}</span>
                    </div>
                    <button class="join-challenge-btn" onclick="joinTeamChallenge('${challenge.id}')">Join Challenge</button>
                </div>
            </div>
        `;
    });
    
    challengesContainer.innerHTML = html;
}

// Recipe Suggestions
function loadRecipeSuggestions() {
    const container = document.getElementById('recipeSuggestions');
    if (!container) return;
    
    const suggestions = [
        {
            name: 'Ethiopian Shiro Power Bowl',
            description: 'Traditional Ethiopian legume stew with modern nutrition boost',
            calories: 380,
            protein: 22,
            prepTime: 30,
            cultural: true,
            sustainability: 95,
            image: 'data:image/svg+xml,%3Csvg width="200" height="150" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="200" height="150" fill="%23DEB887"/%3E%3Ctext x="100" y="75" font-family="Arial" font-size="16" fill="%23654321" text-anchor="middle"%3EShiro Bowl%3C/text%3E%3C/svg%3E'
        },
        {
            name: 'West African Jollof Quinoa',
            description: 'Healthy twist on classic Jollof rice using protein-rich quinoa',
            calories: 320,
            protein: 15,
            prepTime: 25,
            cultural: true,
            sustainability: 88,
            image: 'data:image/svg+xml,%3Csvg width="200" height="150" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="200" height="150" fill="%23FF6347"/%3E%3Ctext x="100" y="75" font-family="Arial" font-size="16" fill="white" text-anchor="middle"%3EJollof Quinoa%3C/text%3E%3C/svg%3E'
        },
        {
            name: 'Modern Tibs Stir-Fry',
            description: 'Ethiopian-inspired vegetable stir-fry with lean protein',
            calories: 290,
            protein: 25,
            prepTime: 20,
            cultural: true,
            sustainability: 82,
            image: 'data:image/svg+xml,%3Csvg width="200" height="150" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="200" height="150" fill="%2332CD32"/%3E%3Ctext x="100" y="75" font-family="Arial" font-size="16" fill="white" text-anchor="middle"%3ETibs Stir-Fry%3C/text%3E%3C/svg%3E'
        }
    ];
    
    let html = '';
    suggestions.forEach(recipe => {
        html += `
            <div class="recipe-suggestion-card">
                <div class="recipe-image">
                    <img src="${recipe.image}" alt="${recipe.name}">
                    ${recipe.cultural ? '<div class="cultural-badge">🌍 Cultural</div>' : ''}
                </div>
                <div class="recipe-content">
                    <h4>${recipe.name}</h4>
                    <p>${recipe.description}</p>
                    <div class="recipe-stats">
                        <span>🔥 ${recipe.calories} cal</span>
                        <span>🥩 ${recipe.protein}g protein</span>
                        <span>⏱️ ${recipe.prepTime} min</span>
                        <span>🌱 ${recipe.sustainability}% sustainable</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="recipe-btn" onclick="addRecipeToCalendar('${recipe.name}')">📅 Add to Calendar</button>
                        <button class="recipe-btn secondary" onclick="viewRecipeDetails('${recipe.name}')">👁️ View Recipe</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Real-time Updates
function setupRealTimeUpdates() {
    // Update progress rings every 30 seconds
    setInterval(() => {
        if (EnhancedAppState.currentTab === 'analytics') {
            updateKPIValues();
        }
    }, 30000);
    
    // Update insights every 5 minutes
    setInterval(() => {
        if (EnhancedAppState.currentTab === 'insights') {
            updateInsightsPanel();
        }
    }, 300000);
}

// Utility Functions
function updateAnalyticsDashboard() {
    updateKPIValues();
    if (EnhancedAppState.charts.nutritionTrends) {
        EnhancedAppState.charts.nutritionTrends.update();
    }
    generateNutritionHeatmap();
}

function updateInsightsPanel() {
    generatePersonalizedRecommendations();
    updatePredictiveAnalytics();
}

function updatePredictiveAnalytics() {
    // Update forecasting charts with new data
    if (EnhancedAppState.charts.weeklyForecast) {
        EnhancedAppState.charts.weeklyForecast.update();
    }
}

// Interactive Functions
function addToMealPlan(item) {
    showToast(`📅 ${item} added to your meal plan!`, 'success');
    // In real app, save to database
}

function logWater(amount) {
    showToast(`💧 Logged ${amount}ml water intake!`, 'success');
    // Update hydration progress
    updateKPIValues();
}

function exploreCulturalFood(foodName) {
    switchEnhancedTab('cultural');
    // Highlight the specific food
    showToast(`🌍 Exploring ${foodName} nutrition benefits!`, 'info');
}

function findPlantBasedMeals() {
    switchEnhancedTab('planning');
    showToast('🌱 Loading plant-based meal suggestions!', 'success');
}

function planMeal(mealType, dayIndex) {
    showToast(`📝 Planning ${mealType} for day ${dayIndex + 1}`, 'info');
    // In real app, open meal selection modal
}

function adoptGoal(goalIndex) {
    showToast('🎯 New goal adopted successfully!', 'success');
    // In real app, add to active goals
}

function joinTeamChallenge(challengeId) {
    showToast('🏆 Successfully joined team challenge!', 'success');
    // In real app, register user for challenge
}

// Chart Period Controls
function changeChartPeriod(period) {
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    // Update chart data based on period
    updateChartData(period);
}

function updateChartData(period) {
    // In real app, fetch data for the specified period
    console.log(`Updating charts for period: ${period}`);
}

// Navigation Functions
function previousWeek() {
    showToast('📅 Loading previous week...', 'info');
    // Update calendar data
}

function nextWeek() {
    showToast('📅 Loading next week...', 'info');
    // Update calendar data
}

// Cultural Food Search
function searchCulturalFoods() {
    const searchTerm = document.getElementById('culturalFoodSearch').value.toLowerCase();
    if (!searchTerm) {
        displayCulturalFoods('all');
        return;
    }
    
    // Filter foods based on search term
    let allFoods = [];
    if (typeof ethiopianFoods !== 'undefined') {
        allFoods = [...allFoods, ...Object.values(ethiopianFoods)];
    }
    if (typeof africanFoods !== 'undefined') {
        allFoods = [...allFoods, ...Object.values(africanFoods)];
    }
    
    const filteredFoods = allFoods.filter(food => 
        food.name.toLowerCase().includes(searchTerm) ||
        food.description.toLowerCase().includes(searchTerm) ||
        food.region.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredCulturalFoods(filteredFoods);
}

function displayFilteredCulturalFoods(foods) {
    const container = document.getElementById('culturalFoodsGrid');
    if (!container) return;
    
    if (foods.length === 0) {
        container.innerHTML = '<div class="no-results">🔍 No foods found matching your search.</div>';
        return;
    }
    
    let html = '';
    foods.forEach(food => {
        html += `
            <div class="cultural-food-card highlighted">
                <div class="food-image">
                    <img src="${food.image}" alt="${food.name}">
                </div>
                <div class="food-content">
                    <h4>${food.name}</h4>
                    <p>${food.description}</p>
                    <div class="food-region">📍 ${food.region}</div>
                    <div class="nutrition-detailed">
                        <div class="nutrition-item">
                            <span class="nutrition-label">Calories:</span>
                            <span class="nutrition-value">${food.calories}</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Protein:</span>
                            <span class="nutrition-value">${food.protein}g</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Fiber:</span>
                            <span class="nutrition-value">${food.fiber}g</span>
                        </div>
                    </div>
                    <button class="learn-more-btn" onclick="viewFoodDetails('${food.name}')">Learn More</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Category Filtering
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('category-btn')) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        const region = e.target.getAttribute('data-region');
        displayCulturalFoods(region);
    }
});

// Enhanced Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

// Loading Management
function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    
    if (overlay && loadingMessage) {
        loadingMessage.textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Goal Management Functions
function updateGoal(goalId) {
    const newValue = prompt('Enter new value for this goal:');
    if (newValue) {
        showToast(`🎯 Goal updated successfully!`, 'success');
        // In real app, save to database and update UI
        updateGoalsDashboard();
    }
}

function viewGoalHistory(goalId) {
    showToast('📊 Loading goal history...', 'info');
    // In real app, show detailed goal history modal
}

// Meal Planning Functions
function addRecipeToCalendar(recipeName) {
    showToast(`📅 ${recipeName} added to your meal calendar!`, 'success');
    generateMealCalendar(); // Refresh calendar
}

function viewRecipeDetails(recipeName) {
    showToast(`👁️ Loading ${recipeName} recipe details...`, 'info');
    // In real app, show detailed recipe modal
}

function viewFoodDetails(foodName) {
    showToast(`🔍 Loading ${foodName} detailed nutrition information...`, 'info');
    // In real app, show detailed food nutrition modal
}

// Community Functions
function followUser(username) {
    showToast(`👥 Now following ${username}!`, 'success');
    // In real app, add to following list
}

function joinTeamChallenge(challengeId) {
    showToast('🚀 Successfully joined the team challenge!', 'success');
    // In real app, register user for challenge
    updateCommunityDashboard();
}

// Enhanced Data Export Function
function exportDashboardData() {
    const data = {
        export_date: new Date().toISOString(),
        nutrition_data: EnhancedAppState.analytics,
        goals_progress: EnhancedAppState.insights,
        meal_plans: 'Current meal planning data',
        cultural_foods_explored: 'User\'s cultural food journey'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `smarteats_dashboard_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('📊 Dashboard data exported successfully!', 'success');
}

// Initialize all enhanced features
console.log('🍎 SmartEats Enhanced Dashboard Ready - Supporting SDG 2 & 3!');
