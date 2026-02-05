# Detailed Neon PostgreSQL Setup Guide

## Complete Step-by-Step Instructions for Party Now App

---

## STEP 1: Create a Neon Account

### 1a. Go to Neon Console
- Open browser and go to: https://console.neon.tech
- You'll see the Neon login page

### 1b. Sign Up (First Time)
If you don't have an account:
1. Click **"Sign up"** button
2. Choose sign-up method:
   - Google account (recommended - easiest)
   - GitHub account
   - Email + password
3. Follow the prompts to complete signup
4. Verify your email if prompted

### 1c. Log In (If Already Have Account)
1. Click **"Sign in"**
2. Enter email and password (or use Google/GitHub)
3. You'll be taken to your Neon dashboard

---

## STEP 2: Create a New Project

### 2a. From Dashboard
Once logged in, you should see:
- A dashboard with "Projects" section
- Either empty or showing existing projects

### 2b. Create New Project
1. Click **"Create project"** or **"New project"** button
2. You'll see a form with:
   - **Project name**: Enter something like `party-now` or `Party Now App`
   - **Database name**: Usually defaults to `neondb` (you can change it)
   - **Region**: Choose closest to your users (e.g., `us-east-1` for USA)
   - **PostgreSQL version**: Leave as default (usually latest)

### 2c. Complete Project Creation
1. Click **"Create project"**
2. Wait 30-60 seconds while Neon sets up your database
3. You'll see a "Connection string" appear

---

## STEP 3: Get Your Connection String

### 3a. Find the Connection String
After project creation, you'll see something like this on screen:

```
Connection string:
postgresql://neondb_owner:abc123defgh456@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require
```

### 3b. Copy the Connection String
1. Look for a **"Copy"** button next to the connection string
2. Click it to copy to clipboard
3. Now you have: `postgresql://neondb_owner:abc123defgh456@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require`

### 3c. Store It Safely
**Keep this connection string for the next steps!**

⚠️ **Important**: This contains your password. Don't share it publicly!

---

## STEP 4: Set Up Environment Variables for Backend

### 4a. Look at Your Backend Folder
In your Party Now project:
```
server/
├── .env.example          (template file)
├── server.js             (actual server code)
└── package.json
```

### 4b. Create `.env` File
1. In your terminal or code editor, go to the `server` folder
2. Create a new file called `.env` (note: no extension)
3. Copy contents from `.env.example`:
   ```
   DATABASE_URL=postgresql://user:password@host/dbname
   JWT_SECRET=your-super-secret-key-change-this
   PORT=3001
   ```

### 4c. Fill In Your Values
Replace the placeholders:

**DATABASE_URL:**
- Paste the connection string you copied from Neon
- Example result:
  ```
  DATABASE_URL=postgresql://neondb_owner:abc123defgh456@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require
  ```

**JWT_SECRET:**
- Create a random secret string (used for token security)
- Options:
  - Generate: `openssl rand -hex 32` in terminal
  - Or just type something complex: `MyS3cur3P@ssw0rd!Random2024Stuff`
- Example result:
  ```
  JWT_SECRET=MyS3cur3P@ssw0rd!Random2024Stuff
  ```

**PORT:**
- Keep as: `3001` (or change if 3001 is unavailable)

### 4d. Final `.env` File
Your server/.env should now look like:
```
DATABASE_URL=postgresql://neondb_owner:abc123defgh456@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require
JWT_SECRET=MyS3cur3P@ssw0rd!Random2024Stuff
PORT=3001
```

### 4e. Save the File
Make sure it's saved in the `server/` folder with exact name `.env`

---

## STEP 5: Test Database Connection Locally (Optional but Recommended)

### 5a. Install Dependencies
```bash
cd server
npm install
```

### 5b. Start the Server
```bash
npm start
```

You should see:
```
✅ Connected to Neon PostgreSQL
✅ Database tables ready
🚀 Server running on port 3001
```

If you see errors:
- Check DATABASE_URL is correct
- Make sure you copied the full connection string from Neon
- Verify Neon project is active

### 5c. Stop the Server
Press `Ctrl+C` to stop

---

## STEP 6: Deploy Backend to Vercel

### 6a. Go to Vercel New Project
1. Open https://vercel.com/new
2. Click "Add GitHub app" or "Continue with GitHub"
3. Find and select: `unitedbusinessglobal/Party_Now`

### 6b. Configure Project Settings
You'll see a form. Fill in:

**Root Directory:**
- Click the dropdown or field for "Root Directory"
- Enter: `server`
- This tells Vercel the backend is in the server folder

**Environment Variables:**
- Click "Environment Variables" section
- Add two variables:

**Variable 1:**
- Name: `DATABASE_URL`
- Value: [Paste your full Neon connection string]
  - Example: `postgresql://neondb_owner:abc123defgh456@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require`
- Click "Add"

**Variable 2:**
- Name: `JWT_SECRET`
- Value: [Paste your secret from earlier]
  - Example: `MyS3cur3P@ssw0rd!Random2024Stuff`
- Click "Add"

### 6c. Deploy
1. Click the **"Deploy"** button
2. Wait for deployment to complete (usually 2-5 minutes)
3. You'll see "Deployment successful" message

### 6d. Get Backend URL
After deployment:
1. You'll see a "Production" URL like:
   ```
   https://party-now-server-12345.vercel.app
   ```
2. **Copy this URL** - you'll need it next!

---

## STEP 7: Deploy Frontend to Vercel

### 7a. Create Frontend Project
1. Go to https://vercel.com/new again
2. Select GitHub repo again: `unitedbusinessglobal/Party_Now`
3. This time keep **Root Directory** empty or `/` (default)

### 7b. Add Frontend Environment Variable
- **Variable Name:** `VITE_API_URL`
- **Value:** Your backend URL from Step 6d
  - Example: `https://party-now-server-12345.vercel.app/api`
  - (Note the `/api` at the end!)
- Click "Add"

### 7c. Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (usually 2-5 minutes)
3. You'll get a frontend URL like:
   ```
   https://party-now-abc123.vercel.app
   ```

---

## STEP 8: Test Your App

### 8a. Go to Frontend URL
Open your frontend URL from Vercel in a browser

### 8b. Create Account
1. Click "Sign up"
2. Enter:
   - **Username:** testuser
   - **Password:** testpass123
3. Click "Sign Up"
4. You should see success message

### 8c. Create Party
1. Click "Create New Party"
2. Fill in:
   - **Party Name:** Test Party
   - **Start Date:** Pick a date
   - **End Date:** Pick a later date
   - **Add Menu Items:** "Pizza", "Salad", "Chips"
3. Click "Create Party"
4. Should see success message and show in party list

### 8d. Test Isolation
1. Log out (click "Logout" button)
2. Create a NEW account with different username
3. You won't see the first party! ✅
4. This proves data isolation is working

---

## STEP 9: Verify Everything in Neon

### 9a. Check Database from Neon Console
1. Go back to https://console.neon.tech
2. Click your project
3. You should see your **data is being stored**

### 9b. View Tables (Optional)
1. Click "SQL Editor" in Neon dashboard
2. Run query to see users:
   ```sql
   SELECT * FROM users;
   ```
3. You should see your test accounts!

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **"Connection refused"** | CONNECTION STRING is wrong. Copy again from Neon |
| **Backend won't deploy** | Check Root Directory is set to `server` in Vercel |
| **Frontend can't reach backend** | Make sure `VITE_API_URL` in frontend matches your backend URL with `/api` at end |
| **Login fails** | Clear browser cache/localStorage, try again |
| **"Database does not exist"** | Wait 1-2 minutes after creating Neon project, it needs setup time |
| **Can't copy connection string** | Click the copy icon, not the string itself |

---

## Architecture Summary

```
Your Browser
    ↓
https://party-now-abc123.vercel.app (Frontend)
    ↓ (HTTPS API calls)
https://party-now-server-12345.vercel.app/api (Backend)
    ↓ (PostgreSQL queries)
Neon PostgreSQL (Database)
    ↓
Stores: Users, Passwords (hashed), Parties, Selections
```

---

## What's Now Stored in Neon

### Users Table
```
id | username | password (hashed) | created_at
1  | testuser | $2a$10$xxxxx...   | 2024-02-05
```

### Parties Table
```
id | party_id | user_id | name | start_date | end_date | menu_items | selections
1  | party-1 | 1       | Test | 2024-02-10 | 2024-02... | JSON array | JSON object
```

---

## Next Steps After Setup

✅ Neon PostgreSQL created
✅ Backend deployed to Vercel
✅ Frontend deployed to Vercel
✅ Everything connected and working

Now you can:
1. Share your app URL with friends
2. Each person creates their account
3. They only see their own parties
4. Data persists forever in Neon!

---

## Security Notes

🔐 **What's Protected:**
- Passwords: Hashed with bcryptjs (not plain text)
- Tokens: Expire after 7 days, require JWT_SECRET to validate
- Database: Only accessible with CONNECTION_STRING
- API: Requires valid JWT token to access party data

🔓 **Public Info:**
- Username (visible when they select items)
- Party name and dates
- When they made selections

⚠️ **Keep SECRET:**
- DATABASE_URL (contains password)
- JWT_SECRET (used to sign tokens)
- Never share these with anyone!

---

## Questions?

If you run into issues:
1. Check the error message carefully
2. Verify all environment variables are correct
3. Ensure connection string is complete (includes `?sslmode=require` at end)
4. Check Neon project is "Active" (not paused)
5. Restart backend server if changes were made

Good luck! 🚀
