# Verve Noir - Deployment Guide

This guide will walk you through deploying the Verve Noir Order Processing System to production.

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed
- Accounts on:
  - [GitHub](https://github.com)
  - [Supabase](https://supabase.com)
  - [Vercel](https://vercel.com)
  - [Fireworks.ai](https://fireworks.ai) (for Kimi K2.5)
  - [GoHighLevel](https://gohighlevel.com) (optional, for integrations)

---

## 🚀 Quick Deployment

### Step 1: Supabase Setup

1. **Create a Supabase project:**
   ```bash
   # Login to Supabase
   supabase login
   
   # Link your project (replace with your project ref)
   supabase link --project-ref your-project-ref
   
   # Or create a new project via the dashboard
   # https://app.supabase.com
   ```

2. **Run the database schema:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/database.sql`
   - Run the SQL

3. **Set up Storage bucket:**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `images`
   - Set it to public
   - Add upload policy for authenticated users:
     ```sql
     CREATE POLICY "Authenticated users can upload images"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'images');
     ```

4. **Deploy the Edge Function:**
   ```bash
   # Set environment variables for the function
   supabase secrets set GHL_WEBHOOK_SECRET=your-webhook-secret
   
   # Deploy the function
   supabase functions deploy ghl-webhook
   ```

5. **Get your credentials:**
   - Go to Project Settings > API
   - Copy `Project URL` and `anon public` key

---

### Step 2: Fireworks.ai Setup (Kimi K2.5)

1. **Create a Fireworks.ai account:**
   - Go to https://fireworks.ai
   - Sign up and verify your account

2. **Get your API key:**
   - Go to Account Settings > API Keys
   - Generate a new API key
   - Copy the key for later use

3. **Verify Kimi K2.5 is available:**
   - Kimi K2.5 is available at: `accounts/fireworks/models/kimi-k2-5`

---

### Step 3: Vercel Deployment

1. **Install Vercel CLI (if not already installed):**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy the project:**
   ```bash
   # From the project directory
   cd verve-noir-app
   
   # Deploy to Vercel
   vercel --prod
   
   # Or deploy with specific settings
   vercel --prod --confirm
   ```

4. **Set environment variables in Vercel:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_FIREWORKS_API_KEY
   vercel env add VITE_GHL_API_KEY
   vercel env add VITE_GHL_LOCATION_ID
   ```

   Or set them in the Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add each variable

---

### Step 4: GitHub Integration

The repository is already created at:
https://github.com/josa-ai/verve-noir-app

To connect Vercel to GitHub for automatic deployments:

1. Go to your Vercel project dashboard
2. Click "Git" in the navigation
3. Connect to GitHub
4. Select the `verve-noir-app` repository
5. Enable automatic deployments on push

---

## ⚙️ Environment Variables

Create a `.env` file locally with these variables:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Fireworks.ai (Required for AI matching)
VITE_FIREWORKS_API_KEY=fw-your-api-key

# GoHighLevel (Optional, for integrations)
VITE_GHL_API_KEY=your-ghl-api-key
VITE_GHL_LOCATION_ID=your-location-id

# AI Matching Configuration (Optional)
VITE_MATCH_AUTO_ACCEPT_THRESHOLD=85
VITE_MATCH_QUICK_REVIEW_THRESHOLD=60
VITE_MATCH_MAX_AI_CANDIDATES=10
```

---

## 🔧 GoHighLevel Integration (Optional)

### Set up Webhooks

1. In GoHighLevel, go to Settings > Webhooks
2. Add a new webhook:
   - **URL**: `https://your-project.supabase.co/functions/v1/ghl-webhook`
   - **Events**: `contact.created`, `contact.updated`, `invoice.paid`
   - **Secret**: Generate a random string and save it as `GHL_WEBHOOK_SECRET` in Supabase

### Create Custom Fields

Create these custom fields in GoHighLevel for contacts:

| Field Name | Field Type |
|------------|------------|
| `item_1_number` | Text |
| `item_1_description` | Text |
| `item_1_quantity` | Number |
| `item_1_image` | Text |
| `item_2_number` | Text |
| `item_2_description` | Text |
| `item_2_quantity` | Number |
| `item_2_image` | Text |
| `item_3_number` | Text |
| `item_3_description` | Text |
| `item_3_quantity` | Number |
| `item_3_image` | Text |

---

## 🧪 Testing the Deployment

1. **Test the login:**
   - Visit your Vercel deployment URL
   - You should see the login page
   - Create a test account or use Supabase Auth admin to create one

2. **Make the user an admin:**
   ```sql
   -- In Supabase SQL Editor
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

3. **Add test products:**
   - Go to the Products page
   - Add a few test products

4. **Test AI matching:**
   - Create an order via GoHighLevel (or directly in Supabase)
   - Check if AI matching works

---

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy preview builds for pull requests
- Deploy to production when you push to `main`

To trigger a deployment:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🛠️ Troubleshooting

### Build Failures

If the build fails on Vercel:

1. Check the build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Check that `vite.config.ts` is correct

### Database Connection Issues

If you can't connect to Supabase:

1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check Row Level Security (RLS) policies
3. Ensure the database schema is applied

### AI Matching Not Working

If AI matching fails:

1. Check `VITE_FIREWORKS_API_KEY` is set correctly
2. Verify you have credits on Fireworks.ai
3. Check browser console for API errors

### Webhooks Not Receiving

If GoHighLevel webhooks aren't working:

1. Check the Edge Function logs in Supabase
2. Verify webhook URL is correct
3. Check the webhook secret is set correctly

---

## 📞 Support

For issues or questions:
- Check the README.md for detailed documentation
- Review Supabase logs in the dashboard
- Check Vercel deployment logs

---

## 📦 Project URLs

After deployment, you'll have:

- **Vercel App**: `https://verve-noir-app.vercel.app` (or your custom domain)
- **Supabase Project**: `https://app.supabase.com/project/your-project-ref`
- **GitHub Repo**: `https://github.com/josa-ai/verve-noir-app`

---

**You're all set!** 🎉
