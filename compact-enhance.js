/**
 * SmartEats Compact Enhancement - Minimized Header & Quick Improvements
 */

document.addEventListener('DOMContentLoaded', function() {
    minimizeHeader();
    addCompactEnhancements();
    addQuickStyles();
});

function minimizeHeader() {
    // Compact header styling
    const style = document.createElement('style');
    style.textContent = `
        /* Minimized Header Styles */
        .header {
            padding: 0.5rem 0 !important;
            background: linear-gradient(135deg, #16a085 0%, #27ae60 100%) !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        }
        
        .header-content {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-bottom: 0.5rem !important;
        }
        
        .logo {
            font-size: 1.5rem !important;
            margin: 0 !important;
            color: white !important;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        }
        
        .tagline {
            font-size: 0.8rem !important;
            margin: 0.25rem 0 !important;
            opacity: 0.9 !important;
            color: white !important;
        }
        
        .nav {
            display: flex !important;
            gap: 0.25rem !important;
            flex-wrap: wrap !important;
            margin-top: 0.5rem !important;
        }
        
        .nav-btn {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.8rem !important;
            border-radius: 20px !important;
            background: rgba(255,255,255,0.1) !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            transition: all 0.3s ease !important;
        }
        
        .nav-btn:hover, .nav-btn.active {
            background: rgba(255,255,255,0.2) !important;
            transform: translateY(-1px) !important;
        }
        
        .header-buttons {
            display: flex !important;
            gap: 0.5rem !important;
        }
        
        .auth-btn, .user-profile-btn {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.8rem !important;
            border-radius: 15px !important;
            background: rgba(255,255,255,0.2) !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            transition: all 0.3s ease !important;
        }
        
        .auth-btn:hover, .user-profile-btn:hover {
            background: rgba(255,255,255,0.3) !important;
            transform: scale(1.05) !important;
        }
        
        /* Compact SDG Banner */
        .sdg-banner {
            display: flex !important;
            gap: 1rem !important;
            margin: 1rem 0 !important;
            padding: 1rem !important;
            background: linear-gradient(135deg, #fff, #f8f9fa) !important;
            border-radius: 15px !important;
            border: 1px solid rgba(22, 160, 133, 0.1) !important;
        }
        
        .sdg-goal {
            flex: 1 !important;
            text-align: center !important;
            padding: 0.5rem !important;
        }
        
        .sdg-goal h3 {
            font-size: 1rem !important;
            margin: 0.5rem 0 !important;
            color: #16a085 !important;
        }
        
        .sdg-goal p {
            font-size: 0.85rem !important;
            margin: 0 !important;
            color: #666 !important;
        }
        
        .sdg-icon {
            font-size: 2rem !important;
            margin-bottom: 0.5rem !important;
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column !important;
                gap: 0.5rem !important;
            }
            
            .nav {
                justify-content: center !important;
            }
            
            .nav-btn {
                font-size: 0.7rem !important;
                padding: 0.3rem 0.6rem !important;
            }
            
            .tagline {
                text-align: center !important;
                font-size: 0.75rem !important;
            }
            
            .sdg-banner {
                flex-direction: column !important;
                gap: 0.5rem !important;
                padding: 0.75rem !important;
            }
            
            .header-buttons {
                flex-wrap: wrap !important;
                justify-content: center !important;
                gap: 0.25rem !important;
            }
            
            .auth-btn, .user-profile-btn {
                font-size: 0.7rem !important;
                padding: 0.3rem 0.6rem !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function addCompactEnhancements() {
    // Add floating action button
    const fab = document.createElement('button');
    fab.innerHTML = '🏠';
    fab.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #16a085, #27ae60);
        color: white;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(22, 160, 133, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    fab.addEventListener('mouseenter', () => {
        fab.style.transform = 'scale(1.1)';
        fab.style.boxShadow = '0 6px 20px rgba(22, 160, 133, 0.5)';
    });
    
    fab.addEventListener('mouseleave', () => {
        fab.style.transform = 'scale(1)';
        fab.style.boxShadow = '0 4px 15px rgba(22, 160, 133, 0.3)';
    });
    
    fab.addEventListener('click', () => {
        if (typeof switchTab === 'function') {
            switchTab('dashboard');
        } else {
            showSection('dashboard');
        }
    });
    
    fab.title = 'Go to Dashboard';
    document.body.appendChild(fab);
    
    // Add quick notification system
    window.showQuickNotif = function(message, type = 'info') {
        const notif = document.createElement('div');
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;
        
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    };
    
    // Add slide animations
    const slideStyle = document.createElement('style');
    slideStyle.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(slideStyle);
}

function addQuickStyles() {
    // Quick enhancement styles
    const quickStyle = document.createElement('style');
    quickStyle.textContent = `
        /* Quick Enhancement Styles */
        .card, .stat-card, .overview-card, .activity-feed {
            border-radius: 15px !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
            transition: all 0.3s ease !important;
            border: 1px solid rgba(22, 160, 133, 0.1) !important;
        }
        
        .card:hover, .stat-card:hover, .overview-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0,0,0,0.12) !important;
        }
        
        .btn-primary, .hero-cta, .quick-action {
            background: linear-gradient(135deg, #16a085, #27ae60) !important;
            border: none !important;
            border-radius: 25px !important;
            padding: 0.75rem 1.5rem !important;
            color: white !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        
        .btn-primary:hover, .hero-cta:hover, .quick-action:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(22, 160, 133, 0.3) !important;
        }
        
        .hero-section {
            background: linear-gradient(135deg, rgba(22, 160, 133, 0.05), rgba(39, 174, 96, 0.05)) !important;
            border-radius: 20px !important;
            border: 1px solid rgba(22, 160, 133, 0.1) !important;
        }
        
        /* Smooth animations */
        * {
            transition: all 0.3s ease !important;
        }
        
        .progress {
            background: linear-gradient(90deg, #16a085, #27ae60) !important;
            border-radius: 10px !important;
        }
        
        .progress-bar {
            background: rgba(22, 160, 133, 0.1) !important;
            border-radius: 10px !important;
        }
        
        /* Focus improvements */
        button:focus, input:focus, select:focus {
            outline: 2px solid #16a085 !important;
            outline-offset: 2px !important;
        }
        
        /* Enhanced visibility */
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50 !important;
            font-weight: 600 !important;
        }
    `;
    document.head.appendChild(quickStyle);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch(e.key) {
            case 'h':
                e.preventDefault();
                if (typeof switchTab === 'function') switchTab('dashboard');
                break;
            case '1':
                e.preventDefault();
                if (typeof switchTab === 'function') switchTab('dashboard');
                break;
            case '2':
                e.preventDefault();
                if (typeof switchTab === 'function') switchTab('nutrition');
                break;
            case '3':
                e.preventDefault();
                if (typeof switchTab === 'function') switchTab('meals');
                break;
            case '4':
                e.preventDefault();
                if (typeof switchTab === 'function') switchTab('chat');
                break;
        }
    }
});

console.log('✨ SmartEats Compact Enhanced!');
console.log('• Minimized header');
console.log('• Quick notifications');
console.log('• Floating action button');
console.log('• Better animations');
console.log('• Keyboard shortcuts (Alt+H, Alt+1-4)');
