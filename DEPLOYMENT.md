# Deployment Guide - Genova Health

## 🚀 Quick Deployment

### Prerequisites
- GitHub account (✅ Already done)
- Render account (for backend)
- Firebase account (✅ Already configured)
- PostgreSQL database (production)

---

## 📦 Backend Deployment (Render.com)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `genova-health-db`
3. Database: `genova_health`
4. User: `genova_admin`
5. Region: Choose closest to your users
6. Plan: **Free** (for testing) or **Starter** ($7/month)
7. Click "Create Database"
8. **Save the connection details!**

### Step 3: Run Migrations
Once database is created:
```bash
# Get the External Database URL from Render dashboard
# It looks like: postgres://user:pass@host/dbname

# Connect and run migrations
psql "postgres://user:pass@host/dbname" < database/schema.sql
psql "postgres://user:pass@host/dbname" < database/migrations/add_admin_features.sql
psql "postgres://user:pass@host/dbname" < database/migrations/add_ratings_system.sql
psql "postgres://user:pass@host/dbname" < database/seeds/admin_seed.sql
```

### Step 4: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `mal4crypt/Genova-health`
3. Configure:
   - **Name**: `genova-health-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   DB_USER=genova_admin
   DB_PASSWORD=<from Render dashboard>
   DB_NAME=genova_health
   DB_HOST=<from Render dashboard>
   DB_PORT=5432
   JWT_SECRET=<generate random 32+ character string>
   FRONTEND_URL=https://genova--health.web.app
   ```

5. Click "Create Web Service"
6. Wait for deployment (3-5 minutes)
7. **Copy your backend URL**: `https://genova-health-api.onrender.com`

---

## 🌐 Frontend Deployment (Firebase)

### Step 1: Update Backend URL
```bash
cd frontend
```

Create `.env.production`:
```env
VITE_API_URL=https://genova-health-api.onrender.com
```

### Step 2: Update API Calls
The frontend already uses `http://localhost:5000` in development. For production, we need to use environment variables.

### Step 3: Build & Deploy
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

Your app will be live at: `https://genova--health.web.app`

---

## 🔧 Post-Deployment Configuration

### Update CORS on Backend
Make sure backend allows your frontend domain (already done in code).

### Test Endpoints
```bash
# Health check
curl https://genova-health-api.onrender.com/

# Login test
curl -X POST https://genova-health-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mal4crypt404@gmail.com","password":"Admin@123"}'
```

### Enable HTTPS Only
Both Render and Firebase automatically use HTTPS ✅

---

## 🗄️ Database Backup (Important!)

### Automated Backups on Render
- Free tier: Manual backups only
- Paid tier: Automatic daily backups

### Manual Backup
```bash
# Backup database
pg_dump "postgres://user:pass@host/dbname" > backup.sql

# Restore from backup
psql "postgres://user:pass@host/dbname" < backup.sql
```

---

## 📊 Monitoring

### Backend Logs (Render)
1. Go to Render dashboard
2. Click on your web service
3. Go to "Logs" tab
4. Monitor real-time logs

### Frontend Analytics (Firebase)
1. Go to Firebase console
2. Select project
3. Analytics → Dashboard

---

## 🔐 Security Checklist

- [x] HTTPS enabled (automatic)
- [x] Environment variables not in code
- [x] JWT secret is strong and random
- [x] Database credentials secured
- [x] CORS configured properly
- [ ] Rate limiting (add later)
- [ ] Input validation (add later)
- [ ] SQL injection prevention (using parameterized queries ✅)

---

## 💰 Cost Estimate

### Free Tier (For Testing)
- **Render PostgreSQL**: Free (512 MB, sleeps after 90 days)
- **Render Web Service**: Free (sleeps after 15 min inactivity)
- **Firebase Hosting**: Free (10 GB storage, 360 MB/day transfer)
- **Total**: $0/month

### Production Tier (Recommended)
- **Render PostgreSQL Starter**: $7/month (256 MB RAM, no sleep)
- **Render Web Service Starter**: $7/month (512 MB RAM, no sleep)
- **Firebase Hosting**: Free (sufficient for most apps)
- **Total**: ~$14/month

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check environment variables are set correctly
- Check database connection string
- View logs in Render dashboard

### Frontend Can't Connect to Backend
- Verify backend URL in `.env.production`
- Check CORS settings
- Verify backend is running (not sleeping)

### Database Connection Error
- Verify database credentials
- Check database is running
- Test connection with psql

### Build Fails
- Check Node version in Render matches local (18.x)
- Verify all dependencies in package.json
- Check build logs for specific errors

---

## 📧 Email & SMS Setup (Optional)

### Twilio (SMS)
1. Sign up at https://twilio.com
2. Get Account SID, Auth Token, and Phone Number
3. Add to Render environment variables:
   ```
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=...
   ```

### SendGrid (Email)
1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add to Render environment variables:
   ```
   SENDGRID_API_KEY=...
   SENDGRID_FROM_EMAIL=...
   ```

---

## 🎯 Next Steps After Deployment

1. Test all features in production
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Add rate limiting for API endpoints
5. Set up automated backups
6. Monitor usage and costs
7. Collect user feedback

---

## 📱 Mobile App (Future)

The current app is a PWA and works on mobile browsers. For native apps:

### iOS App
- Use React Native or Capacitor
- Same backend API
- Submit to App Store

### Android App
- Use React Native or Capacitor
- Same backend API
- Submit to Google Play

---

## ✅ Deployment Complete!

Your app is now live and accessible worldwide! 🎉

**Frontend**: https://genova--health.web.app
**Backend**: https://genova-health-api.onrender.com

Monitor, test, and iterate based on user feedback!
