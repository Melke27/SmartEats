#!/usr/bin/env python3
"""
Simple test script to validate SmartEats backend functionality
"""

import sys
import os
import importlib.util

def test_import(module_name, file_path):
    """Test if a module can be imported successfully"""
    try:
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec is None:
            return False, f"Could not create spec for {module_name}"
        
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return True, f"✅ {module_name} imported successfully"
    except Exception as e:
        return False, f"❌ {module_name} import failed: {str(e)}"

def test_flask_app(module):
    """Test if Flask app is properly configured"""
    try:
        if hasattr(module, 'app'):
            app = module.app
            if app:
                return True, f"✅ Flask app found and configured"
            else:
                return False, "❌ Flask app is None"
        else:
            return False, "❌ No Flask app found in module"
    except Exception as e:
        return False, f"❌ Flask app test failed: {str(e)}"

def main():
    print("🧪 SmartEats Backend Testing")
    print("=" * 40)
    
    # Test files to check
    test_files = [
        ("app", "app.py"),
        ("production_backend_fixed", "production_backend_fixed.py"),
    ]
    
    results = []
    
    for module_name, file_path in test_files:
        if os.path.exists(file_path):
            print(f"\n📝 Testing {file_path}...")
            
            # Test import
            success, message = test_import(module_name, file_path)
            print(f"   Import: {message}")
            results.append(success)
            
            if success:
                # Test Flask app
                try:
                    spec = importlib.util.spec_from_file_location(module_name, file_path)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    
                    app_success, app_message = test_flask_app(module)
                    print(f"   Flask:  {app_message}")
                    results.append(app_success)
                except:
                    print("   Flask:  ❌ Could not test Flask app")
                    results.append(False)
        else:
            print(f"\n📝 Testing {file_path}... ❌ File not found")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 Test Summary:")
    successful_tests = sum(results)
    total_tests = len(results)
    
    if successful_tests == total_tests:
        print(f"✅ All tests passed! ({successful_tests}/{total_tests})")
        return 0
    else:
        print(f"⚠️  Some tests failed: {successful_tests}/{total_tests} passed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
