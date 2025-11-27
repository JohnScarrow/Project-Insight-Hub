#!/bin/bash

echo "🚀 Deploying Project Insight Hub"
echo "================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
fi

echo "Logging into Railway..."
railway login

echo "Initializing Railway project..."
railway init

echo "Deploying backend..."
railway up

echo "✅ Backend deployed!"
echo ""
echo "Next steps:"
echo "1. Get your Railway URL from the dashboard"
echo "2. Update VITE_API_URL in your GitHub Pages environment"
echo "3. Or create a .env file in the root with: VITE_API_URL=https://your-railway-url.com/api"
echo ""
echo "Your app will be live at:"
echo "Frontend: https://johnscarrows.github.io/Project-Insight-Hub/"
echo "Backend: Check Railway dashboard for URL"