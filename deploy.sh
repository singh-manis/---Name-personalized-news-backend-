#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first."
    exit 1
fi

# Check if all changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    git status
    exit 1
fi

echo "✅ Git repository is clean"

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ Frontend built successfully"

# Test backend
echo "🧪 Testing backend..."
cd backend
npm test
if [ $? -ne 0 ]; then
    echo "❌ Backend tests failed"
    exit 1
fi
cd ..

echo "✅ Backend tests passed"

echo "🎉 Ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Choose your deployment platform (Vercel, Netlify, Heroku, etc.)"
echo "2. Set up environment variables"
echo "3. Deploy backend first"
echo "4. Deploy frontend"
echo "5. Update frontend environment variables with backend URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 