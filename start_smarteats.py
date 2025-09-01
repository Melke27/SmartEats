#!/usr/bin/env python3
"""
SmartEats Windows Launcher
Optimized for Windows PowerShell
"""

import os
import sys
import webbrowser
import subprocess
import time

def print_banner():
    print("🍎" + "="*60 + "🍎")
    print("    SmartEats - Hackathon 2025 Demo")
    print("    SDG 2: Zero Hunger | SDG 3: Good Health")
    print("🍎" + "="*60 + "🍎")

def main():
    print_banner()
    
    # Check if setup was run
    if not os.path.exists('.env'):
        print("⚠️ Environment file not found!")
        print("📋 Please run: python setup.py first")
        return False
    
    print("🔧 Starting SmartEats demo...")
    print("📊 Backend API: http://localhost:5000")
    print("🌐 Frontend: Will open in browser...")
    print("\n💡 Demo Features:")
    print("  • Nutrition Calculator (SDG 3)")
    print("  • Recipe Recommender (SDG 2)")
    print("  • AI Nutrition Assistant")
    print("  • Progress Tracking")
    print("  • Community Features")
    print("  • Sustainability Scoring")
    print("\n🔄 Starting backend server...")
    
    try:
        # Start backend server
        backend_path = os.path.join('backend', 'app.py')
        print(f"🚀 Launching: python {backend_path}")
        
        # Open frontend after a delay
        time.sleep(3)
        try:
            frontend_path = os.path.abspath('index.html')
            print(f"🌐 Opening frontend: {frontend_path}")
            webbrowser.open(f'file://{frontend_path}')
            print("✅ Frontend opened in browser")
        except Exception as e:
            print(f"❌ Failed to open frontend: {e}")
        
        # Run the backend (this will block)
        process = subprocess.run([sys.executable, backend_path], cwd='backend')
        
    except KeyboardInterrupt:
        print("\n\n🛑 SmartEats demo stopped")
        print("🙏 Thank you for trying SmartEats!")
        print("🌍 Together we can fight hunger and promote health!")
        return True
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
