# Quick Start: Deploy Party Now to Vercel + Neon

## Step 1: Create Neon Database (5 minutes)

1. Go to https://console.neon.tech
2. Click "Sign up" (free tier available)
3. Create a new project
4. Copy your connection string (looks like: `postgresql://user:password@host/dbname`)
5. Keep this safe - you'll need it in the next steps

## Step 2: Deploy Backend to Vercel

### Option A: Using Vercel GitHub Integration (Recommended)

1. Push your code to GitHub (already done ✅)
2. Go to https://vercel.com/new
3. Select "Continue with GitHub"
4. Find and select `unitedbusinessglobal/Party_Now`
5.:
   - Root Directory: `server`
   - Environment Variables:
     - `DATABASE_URL`: [Paste your Neon connection string]
     - `JWT_SECRET`: [Generate a random string, e.g., use: `openssl rand -hex 32` or paste any complex string]
6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your Vercel deployment URL (e.g., `https://party-now-server.vercel.app`)

### Optional: Create vercel.json for the server

If deployment fails, add this file to the `server` folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## Step 3: Deploy Frontend to Vercel

1. Go back to your Vercel dashboard
2. Create a new project (or update existing)
3. Connect your GitHub repo again
4. Keep the root directory as `/` (default)
5. Add environment variable:
   - `VITE_API_URL`: `https://party-now-server.vercel.app/api` (use your backend URL from Step 2)
6. Click "Deploy"

## Testing the Deployment

1. Visit your frontend URL from Vercel
2. Create a new account (any username/password)
3. Create a party
4. Log out and log in with the same account - your party should still be there
5. Log in with a different username - you won't see the other party
6. Magic! 🎉

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't deploy | Check DATABASE_URL is correct in Vercel environment variables |
| Frontend can't reach backend | Make sure VITE_API_URL matches your deployed backend URL |
| Login fails | Clear browser cache/localStorage and try again |
| Database errors | Check Neon project is active and you have available compute hours |

## What's Inside

- **Frontend**: React + Vite
- **Backend**: Express.js + PostgreSQL
- **Database**: Neon (serverless PostgreSQL)
- **Auth**: JWT tokens + bcryptjs password hashing
- **Data**: Only logged-in users see their parties

## Architecture

```
User Browser
    ↓
React Frontend (Vercel)
    ↓ (HTTPS API calls)
Express Backend (Vercel)
    ↓ (DB queries)
Neon PostgreSQL
```

## Next Steps

- ✅ Setup is complete!
- 🎉 Your app is live with a real database
- 💪 Data persists across browsers and devices
- 🔐 Passwords are hashed and never stored in plain text
