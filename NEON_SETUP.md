# Party Now App - Setup Guide with Neon Database

This app now uses a Node.js backend with Neon PostgreSQL database.

## Prerequisites

- Node.js 18+ installed
- Neon account (https://neon.tech - free tier available)

## Setup Instructions

### 1. Create Neon PostgreSQL Database

1. Go to https://console.neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:password@host/dbname`)

### 2. Setup Backend Server

```bash
# Install dependencies
cd server
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env` and add your Neon connection string:
```
DATABASE_URL=postgresql://your_user:your_password@your_host/your_db
JWT_SECRET=your-super-secret-key-change-in-production
PORT=3001
```

### 3. Setup Frontend

```bash
# Go back to root directory
cd ..

# Create .env file
cp .env.example .env
```

Edit `.env` and set the API URL (for production, use your deployed backend URL):
```
VITE_API_URL=http://localhost:3001/api
```

### 4. Run Locally

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit http://localhost:5173

## Deployment

### Deploy Backend to Vercel

1. Create a new Vercel project and connect your GitHub repository
2. Set the following environment variables in Vercel:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: A secure random string

3. In the Vercel project settings, configure it as an API:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Output Directory: (leave empty for serverless)

Or create a `vercel.json` in the server folder:
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

### Deploy Frontend to Vercel

1. In your Vercel project settings for the frontend
2. Set environment variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.vercel.app/api`)

## API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - Login user

### Parties
- `GET /api/parties` - Get all user's parties
- `POST /api/parties` - Create new party
- `PUT /api/parties/:partyId` - Update party selections
- `DELETE /api/parties/:partyId` - Delete party

All party endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parties (
  id SERIAL PRIMARY KEY,
  party_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  menu_items JSONB NOT NULL,
  selections JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features

✅ User authentication (signup/login)
✅ JWT-based authorization
✅ Party isolation (users only see their own parties)
✅ Party menu management
✅ Daily selections tracking
✅ Party export to CSV
✅ Summary reports
✅ Password hashing with bcryptjs
✅ Secure database with Neon PostgreSQL

## Troubleshooting

**Backend won't connect to Neon:**
- Check DATABASE_URL is correct in .env
- Ensure Neon project is active
- Test connection string in Neon console

**Frontend can't reach backend:**
- Check VITE_API_URL in .env matches your backend URL
- Ensure backend server is running
- Check browser console for CORS errors

**Passwords not matching:**
- Clear browser localStorage
- Try logging in again
- Check backend logs for bcrypt errors
