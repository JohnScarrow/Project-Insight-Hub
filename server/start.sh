#!/bin/bash

# Quick start script for the backend server

echo "🚀 Starting Project Insight Hub Backend..."

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the server/ directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma/client" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "📊 Setting up database..."
    npx prisma migrate dev --name init
    echo "🌱 Seeding database..."
    npx tsx prisma/seed.ts
fi

# Build the TypeScript code
echo "🔨 Building TypeScript..."
npx tsc -p tsconfig.build.json

# Start the server
echo "✅ Starting server on http://localhost:4000"
echo "📝 Press Ctrl+C to stop"
node --experimental-specifier-resolution=node dist/index.js
