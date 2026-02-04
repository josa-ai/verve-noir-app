#!/bin/bash

# Verve Noir Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 Verve Noir Deployment Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        exit 1
    fi
    
    if ! command -v supabase &> /dev/null; then
        echo -e "${YELLOW}⚠️ Supabase CLI is not installed${NC}"
        echo "Install it with: brew install supabase/tap/supabase"
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️ Vercel CLI is not installed${NC}"
        echo "Install it with: npm install -g vercel"
    fi
    
    echo -e "${GREEN}✅ Prerequisites check complete${NC}"
    echo ""
}

# Setup environment variables
setup_env() {
    echo "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️ Created .env file from template${NC}"
        echo "Please edit .env and add your API keys"
        echo ""
        echo "Required variables:"
        echo "  - VITE_SUPABASE_URL"
        echo "  - VITE_SUPABASE_ANON_KEY"
        echo "  - VITE_FIREWORKS_API_KEY"
        echo ""
        read -p "Press enter to continue after editing .env..."
    fi
    
    echo -e "${GREEN}✅ Environment setup complete${NC}"
    echo ""
}

# Deploy to Supabase
deploy_supabase() {
    echo "Deploying to Supabase..."
    
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Supabase CLI not found, skipping${NC}"
        return
    fi
    
    echo "Checking Supabase login status..."
    supabase projects list || {
        echo -e "${YELLOW}Please login to Supabase:${NC}"
        supabase login
    }
    
    echo ""
    echo -e "${YELLOW}Next steps for Supabase:${NC}"
    echo "1. Create a project at https://app.supabase.com"
    echo "2. Link it: supabase link --project-ref YOUR_PROJECT_REF"
    echo "3. Run the database schema in the SQL Editor"
    echo "4. Create the 'images' storage bucket"
    echo "5. Deploy the Edge Function: supabase functions deploy ghl-webhook"
    echo ""
    
    echo -e "${GREEN}✅ Supabase instructions provided${NC}"
    echo ""
}

# Deploy to Vercel
deploy_vercel() {
    echo "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found${NC}"
        echo "Install with: npm install -g vercel"
        exit 1
    fi
    
    echo "Checking Vercel login status..."
    vercel whoami || {
        echo -e "${YELLOW}Please login to Vercel:${NC}"
        vercel login
    }
    
    echo ""
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo -e "${YELLOW}Setting environment variables in Vercel...${NC}"
    echo "Run these commands to set environment variables:"
    echo ""
    echo "vercel env add VITE_SUPABASE_URL"
    echo "vercel env add VITE_SUPABASE_ANON_KEY"
    echo "vercel env add VITE_FIREWORKS_API_KEY"
    echo ""
    
    echo -e "${GREEN}✅ Vercel deployment complete${NC}"
    echo ""
}

# Git operations
git_operations() {
    echo "Pushing to GitHub..."
    
    if [ -d .git ]; then
        git add -A
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
        git push origin main || {
            echo -e "${YELLOW}⚠️ Failed to push to GitHub${NC}"
            echo "You may need to: git push -u origin main"
        }
    else
        echo -e "${YELLOW}⚠️ Not a git repository${NC}"
    fi
    
    echo -e "${GREEN}✅ Git operations complete${NC}"
    echo ""
}

# Main menu
show_menu() {
    echo "What would you like to do?"
    echo ""
    echo "1) Full deployment (all steps)"
    echo "2) Deploy to Supabase only"
    echo "3) Deploy to Vercel only"
    echo "4) Push to GitHub only"
    echo "5) Setup environment only"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice [1-6]: " choice
    
    case $choice in
        1)
            check_prerequisites
            setup_env
            git_operations
            deploy_supabase
            deploy_vercel
            ;;
        2)
            deploy_supabase
            ;;
        3)
            deploy_vercel
            ;;
        4)
            git_operations
            ;;
        5)
            setup_env
            ;;
        6)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            show_menu
            ;;
    esac
}

# Main execution
clear
echo "🚀 Verve Noir Deployment Script"
echo "================================"
echo ""

# If run with arguments, execute specific function
if [ "$1" == "supabase" ]; then
    deploy_supabase
elif [ "$1" == "vercel" ]; then
    deploy_vercel
elif [ "$1" == "github" ]; then
    git_operations
elif [ "$1" == "env" ]; then
    setup_env
else
    show_menu
fi

echo ""
echo "🎉 Deployment script complete!"
echo ""
echo "Next steps:"
echo "1. Visit your Vercel deployment URL"
echo "2. Create an admin user in Supabase Auth"
echo "3. Add some products"
echo "4. Test the AI matching!"
echo ""
