# 🚀 SmartEats Deployment Guide

This guide covers multiple deployment options for the SmartEats application, targeting SDG 2 (Zero Hunger) and SDG 3 (Good Health and Well-Being).

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git (for version control)
- API keys for external services (see Environment Configuration)

## 🔧 Environment Configuration

### 1. Copy Environment Template
```bash
# For development
cp .env.example .env.docker

# For production
cp .env.example .env.production
```

### 2. Update API Keys
Edit your environment file with actual API keys:

```bash
# Required for AI features
HUGGING_FACE_API_KEY=hf_your_token_here
OPENAI_API_KEY=sk-your_key_here

# Required for nutrition data
NUTRITIONIX_API_KEY=your_nutritionix_key
SPOONACULAR_API_KEY=your_spoonacular_key
EDAMAM_API_KEY=your_edamam_key

# Required for payments
STRIPE_SECRET_KEY=sk_test_or_live_key
PAYPAL_CLIENT_ID=your_paypal_id
```

## 🐳 Docker Deployment Options

### Option 1: Quick Development Deployment

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Production Deployment

**Windows (PowerShell):**
```powershell
.\deploy.ps1 -Production
```

**Linux/macOS:**
```bash
./deploy.sh --production
```

### Option 3: Build and Deploy

**Windows:**
```powershell
.\deploy.ps1 -Build -Production
```

**Linux/macOS:**
```bash
./deploy.sh --build --production
```

### Option 4: Manual Docker Compose

```bash
# Development
docker-compose --env-file .env.docker up -d

# Production with Nginx
docker-compose --env-file .env.production --profile production up -d

# With MongoDB instead of MySQL
docker-compose --env-file .env.docker --profile mongodb up -d
```

## ☸️ Kubernetes Deployment

### 1. Update Secrets
Edit `k8s-deployment.yaml` and update the base64 encoded secrets:

```bash
# Encode your secrets
echo -n "your_mysql_password" | base64
echo -n "your_hugging_face_key" | base64
```

### 2. Deploy to Kubernetes
```bash
kubectl apply -f k8s-deployment.yaml
```

### 3. Check Deployment Status
```bash
kubectl get pods -l app=smarteats
kubectl get services -l app=smarteats
```

## 🌐 Cloud Platform Deployments

### Heroku Deployment

1. **Install Heroku CLI**
2. **Login and Create App**
   ```bash
   heroku login
   heroku create smarteats-hackathon
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set DATABASE_TYPE=mysql
   heroku config:set HUGGING_FACE_API_KEY=your_key
   # Add all other required environment variables
   ```

4. **Add MySQL Add-on**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect GitHub Repository**
2. **Set Environment Variables** in Railway dashboard
3. **Deploy automatically** on git push

### DigitalOcean App Platform

1. **Create App** from GitHub repository
2. **Configure Environment Variables**
3. **Set Build Command**: `pip install -r backend/requirements.txt`
4. **Set Run Command**: `python backend/app.py`

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```

### View Application Logs
```bash
# Docker Compose
docker-compose logs -f smarteats-app

# Kubernetes
kubectl logs -f deployment/smarteats-app
```

### Monitor Resource Usage
```bash
# Docker
docker stats

# Kubernetes
kubectl top pods
```

## 🛡️ Security Considerations

### 1. Environment Variables
- Never commit actual API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Database Security
- Use strong passwords
- Enable SSL/TLS connections
- Regular security updates

### 3. HTTPS Configuration
- Obtain SSL certificates (Let's Encrypt recommended)
- Update nginx.conf with SSL configuration
- Redirect HTTP to HTTPS

## 🚀 Performance Optimization

### 1. Scaling
```bash
# Scale application containers
docker-compose up -d --scale smarteats-app=3

# Kubernetes scaling
kubectl scale deployment smarteats-app --replicas=5
```

### 2. Caching
- Redis is included for session storage and caching
- Configure CDN for static assets in production

### 3. Database Optimization
- Regular database maintenance
- Proper indexing
- Connection pooling

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find and kill process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -ti:5000 | xargs kill    # Linux/macOS
```

**2. Database Connection Issues**
```bash
# Check if database container is running
docker-compose ps
docker-compose logs smarteats-db
```

**3. API Key Issues**
- Verify API keys are correctly set in environment file
- Check API key permissions and quotas
- Test API connectivity outside the application

### Getting Help

1. **Check Logs**: Always start with application and database logs
2. **Health Check**: Use the `/api/health` endpoint to verify service status
3. **Container Status**: Check if all containers are running properly

## 📊 Monitoring Dashboards

### Application Metrics
- CPU and memory usage
- Request/response times
- Error rates
- Database performance

### Business Metrics (SDG Impact)
- User nutrition calculations
- Meal recommendations served
- Health goal tracking
- Community engagement

## 🔄 Backup and Recovery

### Database Backups
```bash
# MySQL backup
docker exec smarteats-db mysqldump -u smarteats -p smarteats > backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i smarteats-db mysql -u smarteats -p smarteats < backup_20250901.sql
```

### Application Data Backup
- User profiles and preferences
- Meal logs and nutrition data
- Community and gamification data

---

## 🎯 Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys added and tested
- [ ] Database connection verified
- [ ] Health checks passing
- [ ] SSL certificates configured (production)
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Security measures in place

**SmartEats** is now ready to make a positive impact on global nutrition and health! 🍎✨
