import express from 'express';
import cors from 'cors';
import { db, initSchema } from './db.js';
import { users, transactions, budgets } from './schema.js';
import { eq, and } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize schema on startup
initSchema();

// ====== USERS ======
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, username, password, role, createdAt } = req.body;
  try {
    const [existing] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    await db.insert(users).values({ id, username, password, role, createdAt });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await db.update(users).set({ role }).where(eq(users.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.delete(transactions).where(eq(transactions.userId, id));
    await db.delete(budgets).where(eq(budgets.userId, id));
    await db.delete(users).where(eq(users.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ====== TRANSACTIONS ======
app.get('/api/transactions', async (req, res) => {
  const userId = req.query.userId as string;
  try {
    let result;
    if (userId) {
      result = await db.select().from(transactions).where(eq(transactions.userId, userId));
    } else {
      result = await db.select().from(transactions);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    await db.insert(transactions).values(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string;
  try {
    if (userId) {
      await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    } else {
      await db.delete(transactions).where(eq(transactions.id, id));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ====== BUDGETS ======
app.get('/api/budgets', async (req, res) => {
  const userId = req.query.userId as string;
  try {
    let result;
    if (userId) {
      result = await db.select().from(budgets).where(eq(budgets.userId, userId));
    } else {
      result = await db.select().from(budgets);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    await db.insert(budgets).values(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/budgets/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string;
  try {
    if (userId) {
      await db.update(budgets).set(req.body).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    } else {
      await db.update(budgets).set(req.body).where(eq(budgets.id, id));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string;
  try {
    if (userId) {
      await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
    } else {
      await db.delete(budgets).where(eq(budgets.id, id));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ====== USER DATA CLEAR ======
app.delete('/api/users/:userId/data', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.delete(transactions).where(eq(transactions.userId, userId));
    await db.delete(budgets).where(eq(budgets.userId, userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
