# 🚀 Deployment Guide - Personalized News Platform

This guide covers multiple deployment options for both frontend and backend.

## 📋 Prerequisites

- Node.js 14+ installed
- Git repository set up
- MongoDB database (MongoDB Atlas recommended)
- Environment variables configured

## 🔧 Environment Variables Setup

### Backend (.env)
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_SOCKET_URL=https://your-backend-domain.com
```

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

#### Backend Deployment (Railway)
1. **Sign up** at [Railway.app](https://railway.app)
2. **Connect** your GitHub repository
3. **Select** the backend folder
4. **Add environment variables** in Railway dashboard
5. **Deploy** - Railway will auto-deploy on push

#### Frontend Deployment (Vercel)
1. **Sign up** at [Vercel.com](https://vercel.com)
2. **Import** your GitHub repository
3. **Configure**:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add environment variables** in Vercel dashboard
5. **Deploy**

### Option 2: Netlify (Frontend) + Render (Backend)

#### Backend Deployment (Render)
1. **Sign up** at [Render.com](https://render.com)
2. **Create** a new Web Service
3. **Connect** your GitHub repository
4. **Configure**:
   - Name: `personalized-news-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add environment variables**
6. **Deploy**

#### Frontend Deployment (Netlify)
1. **Sign up** at [Netlify.com](https://netlify.com)
2. **Import** your GitHub repository
3. **Configure**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
4. **Add environment variables**
5. **Deploy**

### Option 3: Heroku (Both Frontend & Backend)

#### Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
cd backend
heroku create your-app-name-backend

# Add environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set GEMINI_API_KEY=your_gemini_key
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Frontend Deployment
```bash
# Create Heroku app for frontend
cd frontend
heroku create your-app-name-frontend

# Add buildpack
heroku buildpacks:set mars/create-react-app

# Add environment variables
heroku config:set REACT_APP_API_URL=https://your-backend-app.herokuapp.com

# Deploy
git add .
git commit -m "Deploy frontend"
git push heroku main
```

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create** MongoDB Atlas account
2. **Create** a new cluster
3. **Set up** database access (username/password)
4. **Configure** network access (allow all IPs: 0.0.0.0/0)
5. **Get** connection string
6. **Add** to backend environment variables

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses authentication
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] HTTPS is enabled
- [ ] API keys are secured

## 📊 Performance Optimization

### Frontend
- [ ] Build optimization enabled
- [ ] Source maps disabled in production
- [ ] Code splitting implemented
- [ ] Image optimization

### Backend
- [ ] Compression middleware enabled
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Logging configured

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS includes frontend domain
   - Check environment variables

2. **MongoDB Connection Issues**
   - Verify connection string
   - Check network access settings
   - Ensure database user has proper permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Verify no trailing spaces

## 📞 Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify environment variables
3. Test locally with production environment
4. Check network connectivity

## 🎉 Post-Deployment

After successful deployment:
1. Test all features
2. Monitor performance
3. Set up error tracking (Sentry recommended)
4. Configure analytics
5. Set up monitoring alerts 