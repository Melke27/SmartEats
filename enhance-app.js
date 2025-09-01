/**
 * SmartEats Enhancement Script
 * Adds animations, better styling, and improved UX to the existing application
 */

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    enhanceApplication();
    addAnimations();
    improveVisibility();
    addAccessibilityFeatures();
    addHomePageLink();
});

function enhanceApplication() {
    // Add enhanced styling links to head
    const head = document.head;
    
    // Add Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    head.appendChild(fontAwesome);
    
    // Add Google Fonts
    const googleFonts = document.createElement('link');
    googleFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    googleFonts.rel = 'stylesheet';
    head.appendChild(googleFonts);
    
    // Add enhanced CSS if files exist
    const enhancedStyle = document.createElement('link');
    enhancedStyle.rel = 'stylesheet';
    enhancedStyle.href = 'enhanced-style.css';
    enhancedStyle.onerror = () => console.log('Enhanced styles not found - using fallback styles');
    head.appendChild(enhancedStyle);
    
    // Add inline enhanced styles
    const inlineStyles = document.createElement('style');
    inlineStyles.textContent = `
        /* Enhanced Animation Styles */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(22, 160, 133, 0.5); }
            50% { box-shadow: 0 0 20px rgba(22, 160, 133, 0.8), 0 0 30px rgba(22, 160, 133, 0.6); }
            100% { box-shadow: 0 0 5px rgba(22, 160, 133, 0.5); }
        }
        
        /* Enhanced UI Classes */
        .enhanced-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            padding: 2rem;
            margin: 1rem 0;
            border: 1px solid rgba(22, 160, 133, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .enhanced-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #16a085, #27ae60, #2ecc71);
        }
        
        .enhanced-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .enhanced-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.875rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .enhanced-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        
        .enhanced-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        
        .enhanced-btn:hover::before {
            left: 100%;
        }
        
        .floating-action-btn {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
            transition: all 0.3s ease;
            z-index: 1000;
            animation: pulse 2s infinite;
        }
        
        .floating-action-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
        }
        
        .notification-toast {
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            z-index: 1001;
            max-width: 350px;
            animation: slideInRight 0.5s ease-out;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .toast-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .toast-icon {
            font-size: 1.5rem;
            margin-right: 0.75rem;
        }
        
        .toast-title {
            font-weight: 600;
            flex: 1;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s;
        }
        
        .toast-close:hover {
            opacity: 1;
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        .animate-pulse {
            animation: pulse 2s infinite;
        }
        
        /* Enhanced form styling */
        .enhanced-form-group {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .enhanced-form-control {
            width: 100%;
            padding: 1rem 1.5rem;
            border: 2px solid #e9ecef;
            border-radius: 15px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: white;
        }
        
        .enhanced-form-control:focus {
            outline: none;
            border-color: #16a085;
            box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.1);
            transform: translateY(-1px);
        }
        
        /* Improved loading states */
        .enhanced-loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .floating-action-btn {
                bottom: 1rem;
                right: 1rem;
                width: 50px;
                height: 50px;
                font-size: 1.2rem;
            }
            
            .notification-toast {
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .enhanced-card {
                padding: 1.5rem;
            }
        }
    `;
    head.appendChild(inlineStyles);
}

function addAnimations() {
    // Add animations to existing elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    });
    
    // Observe all cards and form containers
    document.querySelectorAll('.card, .form-container, .results-container').forEach(el => {
        observer.observe(el);
        if (!el.classList.contains('enhanced-card')) {
            el.classList.add('enhanced-card');
        }
    });
    
    // Enhance existing buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        if (!btn.classList.contains('enhanced-btn')) {
            btn.classList.add('enhanced-btn');
        }
    });
    
    // Add floating animation to logo
    const logoIcon = document.querySelector('.logo-icon');
    if (logoIcon) {
        logoIcon.classList.add('animate-float');
    }
    
    // Add glow effect to active navigation
    document.querySelectorAll('.nav-btn.active').forEach(btn => {
        btn.classList.add('animate-glow');
    });
}

function improveVisibility() {
    // Improve contrast and visibility of elements
    const style = document.createElement('style');
    style.textContent = `
        /* Improved visibility styles */
        .nav-btn {
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .nav-btn.active {
            background: linear-gradient(135deg, #16a085, #27ae60);
            box-shadow: 0 4px 15px rgba(22, 160, 133, 0.3);
        }
        
        .card h1, .card h2, .card h3 {
            color: #2c3e50;
            font-weight: 700;
        }
        
        .form-label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.75rem;
        }
        
        .result-value {
            text-shadow: 0 2px 4px rgba(22, 160, 133, 0.2);
        }
        
        /* Better focus indicators */
        button:focus, input:focus, select:focus, textarea:focus {
            outline: 3px solid rgba(22, 160, 133, 0.5);
            outline-offset: 2px;
        }
        
        /* Improved hover states */
        .nav-btn:hover {
            background: rgba(22, 160, 133, 0.1);
            transform: translateY(-1px);
        }
        
        .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }
    `;
    document.head.appendChild(style);
}

function addAccessibilityFeatures() {
    // Add ARIA labels and improve accessibility
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const tabName = btn.getAttribute('data-tab');
        if (tabName && !btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', `Navigate to ${tabName}`);
            btn.setAttribute('role', 'tab');
        }
    });
    
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id if it doesn't exist
    const main = document.querySelector('.main');
    if (main && !main.id) {
        main.id = 'main-content';
    }
}

function addHomePageLink() {
    // Add homepage link to logo
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
        navLogo.style.cursor = 'pointer';
        navLogo.title = 'View SmartEats Homepage';
        navLogo.addEventListener('click', () => {
            window.open('homepage.html', '_blank');
        });
    }
    
    // Add floating action button for homepage
    const fab = document.createElement('button');
    fab.className = 'floating-action-btn';
    fab.innerHTML = '<i class="fas fa-home"></i>';
    fab.title = 'Go to Homepage';
    fab.setAttribute('aria-label', 'Go to SmartEats Homepage');
    fab.addEventListener('click', () => {
        window.open('homepage.html', '_blank');
    });
    document.body.appendChild(fab);
}

function showEnhancedNotification(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => toast.remove(), 500);
        }
    }, duration);
}

// Enhanced utility functions
function addShimmerEffect(element) {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
        pointer-events: none;
    `;
    element.appendChild(shimmer);
}

function addCounterAnimation(element, targetNumber, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (targetNumber - start) * easeOutCubic(progress));
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Expose enhanced functions globally
window.SmartEatsEnhanced = {
    showNotification: showEnhancedNotification,
    addShimmer: addShimmerEffect,
    animateCounter: addCounterAnimation
};

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + H for homepage
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.open('homepage.html', '_blank');
    }
    
    // Alt + 1-7 for tab navigation
    if (e.altKey && e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const tabs = ['dashboard', 'nutrition', 'meals', 'chat', 'wellness', 'community', 'sustainability'];
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex] && typeof switchTab === 'function') {
            switchTab(tabs[tabIndex]);
        }
    }
});

console.log('🚀 SmartEats Enhanced! New features added:');
console.log('   • Beautiful animations and transitions');
console.log('   • Improved accessibility and keyboard navigation');
console.log('   • Enhanced visual design with gradients and shadows');
console.log('   • Homepage integration (click logo or floating button)');
console.log('   • Smart notifications system');
console.log('   • Better mobile responsiveness');
console.log('');
console.log('Keyboard shortcuts:');
console.log('   • Alt + H: Open homepage');
console.log('   • Alt + 1-7: Navigate between tabs');
console.log('');
console.log('Try: window.SmartEatsEnhanced.showNotification("Hello!", "success")');
