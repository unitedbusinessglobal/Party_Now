import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from 'pg';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let dbConnected = false;

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL');
    
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS parties (
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
    `);

    console.log('✅ Database tables ready');
    dbConnected = true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Helper function to generate JWT
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware to verify JWT
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// AUTHENTICATION ROUTES

// Sign Up
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Check if user exists
    const userExists = await client.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const result = await client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      user: { id: user.id, username: user.username },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const result = await client.query('SELECT id, username, password FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      user: { id: user.id, username: user.username },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// PARTY ROUTES

// Get all parties for logged-in user
app.get('/api/parties', verifyToken, async (req, res) => {
  try {
    const result = await client.query(
      'SELECT party_id, name, start_date, end_date, menu_items, selections, created_at FROM parties WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    const parties = {};
    result.rows.forEach(row => {
      parties[row.party_id] = {
        id: row.party_id,
        name: row.name,
        startDate: row.start_date,
        endDate: row.end_date,
        menuItems: row.menu_items,
        selections: row.selections,
        createdAt: row.created_at
      };
    });

    res.json(parties);
  } catch (error) {
    console.error('Get parties error:', error);
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
});

// Create party
app.post('/api/parties', verifyToken, async (req, res) => {
  const { partyId, name, startDate, endDate, menuItems } = req.body;

  if (!partyId || !name || !startDate || !endDate || !menuItems) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await client.query(
      'INSERT INTO parties (party_id, user_id, name, start_date, end_date, menu_items, selections) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING party_id, name, start_date, end_date, menu_items, selections, created_at',
      [partyId, req.userId, name, startDate, endDate, JSON.stringify(menuItems), JSON.stringify({})]
    );

    const row = result.rows[0];
    const party = {
      id: row.party_id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      menuItems: row.menu_items,
      selections: row.selections,
      createdAt: row.created_at
    };

    res.status(201).json(party);
  } catch (error) {
    console.error('Create party error:', error);
    res.status(500).json({ error: 'Failed to create party' });
  }
});

// Update party (selections)
app.put('/api/parties/:partyId', verifyToken, async (req, res) => {
  const { partyId } = req.params;
  const { selections } = req.body;

  try {
    const result = await client.query(
      'UPDATE parties SET selections = $1 WHERE party_id = $2 AND user_id = $3 RETURNING party_id, name, start_date, end_date, menu_items, selections, created_at',
      [JSON.stringify(selections), partyId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    const row = result.rows[0];
    const party = {
      id: row.party_id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      menuItems: row.menu_items,
      selections: row.selections,
      createdAt: row.created_at
    };

    res.json(party);
  } catch (error) {
    console.error('Update party error:', error);
    res.status(500).json({ error: 'Failed to update party' });
  }
});

// Delete party
app.delete('/api/parties/:partyId', verifyToken, async (req, res) => {
  const { partyId } = req.params;

  try {
    const result = await client.query(
      'DELETE FROM parties WHERE party_id = $1 AND user_id = $2',
      [partyId, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete party error:', error);
    res.status(500).json({ error: 'Failed to delete party' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbConnected });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.end();
  process.exit(0);
});
