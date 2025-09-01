# 🌐 SmartEats Netlify Deployment Guide

Complete guide to deploy your SmartEats application on Netlify with serverless functions.

## 🚀 Quick Netlify Deployment Steps

### Step 1: Connect GitHub Repository to Netlify

1. **Go to [Netlify](https://app.netlify.com/)**
2. **Sign up/Login** with your GitHub account
3. **Click "Add new site"** → **"Import an existing project"**
4. **Choose GitHub** as your Git provider
5. **Select your repository**: `Melke27/SmartEats`
6. **Configure build settings**:
   - **Build command**: `echo 'Building SmartEats...'`
   - **Publish directory**: `.` (current directory)
   - **Functions directory**: `netlify/functions`

### Step 2: Configure Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```bash
# AI Services
HUGGING_FACE_API_KEY=hf_your_token_here
OPENAI_API_KEY=sk-your_key_here

# Nutrition APIs
NUTRITIONIX_APP_ID=your_nutritionix_app_id
NUTRITIONIX_API_KEY=your_nutritionix_api_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
EDAMAM_APP_ID=your_edamam_app_id
EDAMAM_API_KEY=your_edamam_api_key

# Payment APIs (for premium features)
STRIPE_PUBLIC_KEY=pk_test_or_live_key
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Step 3: Deploy!

1. **Click "Deploy site"**
2. **Wait for build to complete** (usually 1-2 minutes)
3. **Your site will be live** at something like `https://amazing-name-123456.netlify.app`

## 🎯 Custom Domain Setup (Optional)

### Step 1: Add Custom Domain
1. Go to **Site settings** → **Domain management**
2. **Click "Add custom domain"**
3. **Enter your domain** (e.g., `smarteats.yourdomain.com`)

### Step 2: Configure DNS
Add these DNS records at your domain provider:

```
Type: CNAME
Name: smarteats (or www)
Value: amazing-name-123456.netlify.app
```

### Step 3: Enable HTTPS
1. **Go to "HTTPS" section** in domain settings
2. **Click "Verify DNS configuration"**
3. **Enable "Force HTTPS"**

## 🔧 Advanced Configuration

### Custom Build Command
If you need to process files before deployment:

```bash
# In netlify.toml
[build]
  command = "npm run build"  # if you add a build process
  publish = "dist"           # if you build to a dist folder
```

### Environment-Specific Settings

```toml
# netlify.toml
[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "staging" }
```

## 🛠️ Serverless Functions

Your API endpoints will be available at:
- **Health Check**: `https://yoursite.netlify.app/api/health`
- **Nutrition Calculator**: `https://yoursite.netlify.app/api/nutrition/calculate`
- **AI Chat**: `https://yoursite.netlify.app/api/ai/chat`

### Testing Functions Locally

Install Netlify CLI:
```bash
npm install -g netlify-cli
```

Run development server:
```bash
netlify dev
```

## 📊 Monitoring & Analytics

### Build & Deploy Logs
- Check **Deploys** tab in Netlify dashboard
- View build logs for troubleshooting
- Monitor function execution logs

### Performance Monitoring
- Use **Analytics** tab for traffic insights
- Monitor **Functions** tab for serverless performance
- Set up **Form handling** for user feedback

## 🔒 Security Best Practices

### Environment Variables
- ✅ All API keys stored as environment variables
- ✅ No secrets in repository
- ✅ Production vs development configurations

### HTTPS & Headers
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Security headers configured in `netlify.toml`
- ✅ CORS properly configured

## 🐛 Troubleshooting

### Common Issues

**1. Function Not Working**
```bash
# Check function logs in Netlify dashboard
# Verify Python syntax in netlify/functions/api.py
# Check environment variables are set
```

**2. API Endpoints Not Found**
```bash
# Verify netlify.toml redirects are correct
# Check function file naming (must match URL)
# Test with curl or Postman
```

**3. CORS Errors**
```bash
# Frontend accessing different domain
# Check CORS headers in function responses
# Verify Access-Control-Allow-Origin is set
```

### Build Failures

**Check build logs** in Netlify dashboard:
1. Go to **Deploys** tab
2. Click on failed deployment
3. Check **Deploy log** for errors

## 🌍 Going Live Checklist

- [ ] Repository pushed to GitHub
- [ ] Netlify site connected and deployed
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Performance monitoring set up

## 📱 Frontend-Only Deployment Alternative

If you want to deploy just the frontend without serverless functions:

1. **Set build command**: `echo 'Static site deployment'`
2. **Publish directory**: `.`
3. **Skip functions setup**
4. **Use external APIs** directly from frontend

## 🎯 Next Steps After Deployment

1. **Test all features** on live site
2. **Monitor performance** and user engagement
3. **Set up analytics** to track SDG impact
4. **Implement feedback system**
5. **Scale based on usage**

---

## 🚀 One-Click Deploy Button

Add this to your README.md for easy deployment:

```markdown
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Melke27/SmartEats)
```

**Your SmartEats application is now ready to make a global impact on nutrition and health!** 🍎✨
