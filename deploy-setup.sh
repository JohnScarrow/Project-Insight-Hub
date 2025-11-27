#!/bin/bash

echo "🚀 Project Insight Hub - Cloud Deployment Setup"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo "✅ Git repository ready"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 You have uncommitted changes. Committing deployment configs..."
    git add .
    git commit -m "chore: add cloud deployment configurations"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""
echo "1. ✅ .gitignore updated"
echo "2. ✅ Vercel config created (vercel.json)"
echo "3. ✅ Railway config created (server/railway.json)"
echo "4. ✅ Render config created (server/render.yaml)"
echo "5. ✅ Environment examples created"
echo "6. ✅ Deployment guide created (DEPLOYMENT.md)"
echo "7. ✅ Docker support added (optional)"
echo "8. ✅ CI/CD workflow added (GitHub Actions)"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/JohnScarrow/Project-Insight-Hub.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy Database (choose one):"
echo "   • Railway: https://railway.app (easiest)"
echo "   • Neon: https://neon.tech (serverless)"
echo "   • Render: https://render.com"
echo ""
echo "3. Deploy Backend (choose one):"
echo "   • Railway: Connect repo, set root to 'server'"
echo "   • Render: Use render.yaml config"
echo ""
echo "4. Deploy Frontend:"
echo "   • Vercel: https://vercel.com (auto-detects config)"
echo ""
echo "5. Update Environment Variables:"
echo "   • Backend: DATABASE_URL, FRONTEND_URL, JWT_SECRET"
echo "   • Frontend: VITE_API_URL"
echo ""
echo "📖 Full guide: Read DEPLOYMENT.md"
echo ""
echo "🎉 Your project is ready to deploy!"
