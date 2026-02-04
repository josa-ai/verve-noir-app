# 🎉 Verve Noir - Deployed!

## Production URL
🔗 **https://verve-noir-asaj8owv3-ernesto-josatos-projects.vercel.app**

---

## ✅ What's Live

Your Verve Noir Order Processing System is now deployed and accessible!

### Current Status
- ✅ Frontend deployed to Vercel
- ✅ Code pushed to GitHub
- ✅ Build successful
- ⏳ Supabase setup required
- ⏳ Environment variables needed

---

## 🔧 Next Steps to Complete Setup

### 1. Create Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Copy the Project URL and Anon Key

### 2. Run Database Schema
In your Supabase project:
1. Go to SQL Editor
2. Copy the contents of `supabase/database.sql`
3. Run the SQL script

### 3. Set Up Storage Bucket
1. Go to Storage in Supabase dashboard
2. Create a new bucket called `images`
3. Set it to public
4. Add upload policy for authenticated users

### 4. Add Environment Variables to Vercel
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_FIREWORKS_API_KEY
```

Or go to Vercel Dashboard > Project Settings > Environment Variables

### 5. Deploy Edge Function (Optional - for GoHighLevel webhooks)
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy ghl-webhook
```

### 6. Create Admin User
1. Visit your deployed app
2. Sign up with your email
3. In Supabase SQL Editor, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

---

## 📁 Project Links

| Resource | URL |
|----------|-----|
| **Live App** | https://verve-noir-asaj8owv3-ernesto-josatos-projects.vercel.app |
| **GitHub Repo** | https://github.com/josa-ai/verve-noir-app |
| **Vercel Dashboard** | https://vercel.com/ernesto-josatos-projects/verve-noir-app |

---

## 🔐 Required Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `VITE_FIREWORKS_API_KEY` | Fireworks.ai API key | https://fireworks.ai > Account Settings |
| `VITE_GHL_API_KEY` | GoHighLevel API key | GoHighLevel Settings > API |
| `VITE_GHL_LOCATION_ID` | GoHighLevel location ID | GoHighLevel URL or Settings |

---

## 🚀 Redeploy

To redeploy after making changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel will auto-deploy from GitHub
```

Or manually:
```bash
vercel --prod
```

---

**Your app is live!** 🎊

Complete the Supabase setup to start using the full functionality.
