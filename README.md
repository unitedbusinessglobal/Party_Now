# Menu Calendar App - Vercel Deployment

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Easiest)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to this folder:
   ```bash
   cd vercel
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts (login, select project settings)

5. Your app will be live! Share the URL with your guests.

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New..." → "Project"
3. Upload this entire `vercel` folder (or connect a Git repository)
4. Vercel will auto-detect it's a Vite + React app
5. Click "Deploy"
6. Done! Your app is live.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173

### Build for Production

```bash
npm run build
```

The production files will be in the `dist` folder.

## Notes

- Storage works via localStorage in the browser
- All data is shared across users accessing the same URL
- Free tier on Vercel is perfect for this app
- Custom domain can be added in Vercel dashboard
