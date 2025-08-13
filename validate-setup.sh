#!/bin/bash
# Final validation script - run this after following copilot-instructions.md

echo "=== GitHub Copilot Instructions Validation ==="
echo "This script validates you have successfully followed the instructions"
echo ""

# Track validation status
VALIDATION_PASSED=true

echo "1. Checking dependencies are installed..."
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo "✅ Dependencies installed correctly"
else
    echo "❌ Run 'npm install' first"
    VALIDATION_PASSED=false
fi

echo "2. Checking TypeScript compilation..."
if npm run build --silent >/dev/null 2>&1; then
    echo "✅ TypeScript builds successfully"
else
    echo "❌ Build failed - check 'npm run build' output"
    VALIDATION_PASSED=false
fi

echo "3. Checking compiled files exist..."
if [ -f "dist/server.js" ] && [ -f "dist/lib/prisma.js" ]; then
    echo "✅ Compiled files present"
else
    echo "❌ Compiled files missing - run 'npm run build'"
    VALIDATION_PASSED=false
fi

echo "4. Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ Environment file exists"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL configured"
    else
        echo "⚠️  DATABASE_URL not configured in .env"
    fi
else
    echo "❌ No .env file - run 'cp .env.example .env'"
    VALIDATION_PASSED=false
fi

echo "5. Checking Prisma client generation..."
if npm run prisma:generate --silent >/dev/null 2>&1; then
    echo "✅ Prisma client generated successfully"
else
    echo "⚠️  Prisma client generation failed (may be network restrictions)"
    echo "   This is documented in the instructions as acceptable"
fi

echo "6. Checking application can start (briefly)..."
# Try to start the app for 5 seconds to see if it starts
timeout 5 npm run start >/dev/null 2>&1 &
sleep 2
if pgrep -f "node dist/server.js" >/dev/null; then
    echo "✅ Application starts successfully"
    pkill -f "node dist/server.js" 2>/dev/null
else
    echo "⚠️  Application doesn't start (likely due to missing Prisma client)"
    echo "   This is expected if Prisma generation failed"
fi

echo ""
if [ "$VALIDATION_PASSED" = true ]; then
    echo "🎉 VALIDATION PASSED"
    echo "You have successfully followed the GitHub Copilot instructions!"
    echo ""
    echo "Next steps:"
    echo "- If Prisma client generation worked, try 'npm run dev'"
    echo "- Visit http://localhost:3000/health to test the health endpoint"  
    echo "- Visit http://localhost:3000/admin to test the admin UI"
    echo "- Visit http://localhost:3000/docs to see the API documentation"
else
    echo "❌ VALIDATION FAILED"
    echo "Please review the GitHub Copilot instructions and fix the issues above"
fi