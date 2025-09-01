#!/usr/bin/env python3
"""
SmartEats Server Startup Script
Ensures clean startup without socket conflicts
"""

import os
import sys
import subprocess
import time

def kill_existing_processes():
    """Kill any existing Python processes on port 5000"""
    try:
        # Kill processes using port 5000
        if os.name == 'nt':  # Windows
            subprocess.run(['taskkill', '/F', '/IM', 'python.exe'], capture_output=True)
        else:  # Unix/Linux/Mac
            subprocess.run(['pkill', '-f', 'python.*app.py'], capture_output=True)
        
        # Wait a moment for cleanup
        time.sleep(1)
    except Exception as e:
        print(f"Note: {e}")

def start_server():
    """Start the SmartEats Flask server"""
    print("🍎 Starting SmartEats Application...")
    print("🔄 Cleaning up any existing processes...")
    
    kill_existing_processes()
    
    print("🚀 Launching server...")
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    # Start the Flask app
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    start_server()
