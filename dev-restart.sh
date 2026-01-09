#!/bin/bash
# dev-restart.sh - Kill and restart development server on port 3000

echo "🔄 Restarting dev server on port 3000..."

# Kill any existing node/vite processes
pkill -9 -f "node.*vite" 2>/dev/null || true
pkill -9 -f "npm run dev" 2>/dev/null || true

# Wait a moment for cleanup
sleep 1

# Kill anything still on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait before restarting
sleep 1

# Start fresh dev server
echo "✅ Starting dev server..."
npm run dev
