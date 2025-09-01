#!/usr/bin/env python3
"""
SmartEats Run Script
Hackathon 2025 - Quick demo launcher
"""

import os
import sys
import webbrowser
import subprocess
import time
from threading import Thread

def print_banner():
    print("🍎" + "="*60 + "🍎")
    print("    SmartEats - Hackathon 2025 Demo")
    print("    SDG 2: Zero Hunger | SDG 3: Good Health")
    print("🍎" + "="*60 + "🍎")

def start_backend():
    """Start the Flask backend server"""
    try:
        print("🚀 Starting Python Flask backend...")
        backend_path = os.path.join(os.getcwd(), 'backend', 'app.py')
        subprocess.run([sys.executable, backend_path], cwd=os.path.join(os.getcwd(), 'backend'))
    except KeyboardInterrupt:
        print("\n⏹️ Backend server stopped")
    except Exception as e:
        print("❌ Backend error:", e)

def open_frontend():
    """Open the frontend in browser"""
    time.sleep(2)  # Wait for backend to start
    try:
        frontend_path = os.path.abspath('index.html')
        print(f"🌐 Opening frontend: {frontend_path}")
        webbrowser.open(f'file://{frontend_path}')
        print("✅ Frontend opened in browser")
    except Exception as e:
        print("❌ Failed to open frontend:", e)

def main():
    print_banner()
    
    # Check if setup was run
    if not os.path.exists('.env'):
        print("⚠️ Environment file not found!")
        print("📋 Please run: python setup.py first")
        return False
    
    print("🔧 Starting SmartEats demo...")
    print("📊 Backend API: http://localhost:5000")
    print("🌐 Frontend: Opening in browser...")
    print("\n💡 Demo Features:")
    print("  • Nutrition Calculator (SDG 3)")
    print("  • Recipe Recommender (SDG 2)")
    print("  • AI Nutrition Assistant")
    print("  • Progress Tracking")
    print("\n🔄 Press Ctrl+C to stop the demo")
    
    # Start backend in a separate thread
    backend_thread = Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Open frontend
    frontend_thread = Thread(target=open_frontend, daemon=True)
    frontend_thread.start()
    
    try:
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 SmartEats demo stopped")
        print("🙏 Thank you for trying SmartEats!")
        print("🌍 Together we can fight hunger and promote health!")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
