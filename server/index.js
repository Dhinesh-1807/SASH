import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://aqrghnxmorhaumjgpzjk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YtbktvivP5rPuxSuHww2Yw_lyK4MXTz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 1. Health Check for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SASH Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to SASH High-Performance Productivity API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      status: '/api/status',
      profiles: '/api/profiles/:userId',
      schedules: '/api/schedules/:userId',
      activities: '/api/activities/:userId',
      reminders: '/api/reminders/:userId'
    }
  });
});

// 2. Database Status Check
app.get('/api/status', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      return res.status(500).json({ connected: false, error: error.message });
    }
    res.json({
      connected: true,
      database: 'PostgreSQL (Supabase Cloud)',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// 3. User Profiles API
app.get('/api/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Schedules API
app.get('/api/schedules/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ schedules: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .insert([req.body])
      .select()
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ schedule: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Activities API
app.get('/api/activities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ activities: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert([req.body])
      .select()
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ activity: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Reminders API
app.get('/api/reminders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ reminders: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reminders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .insert([req.body])
      .select()
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ reminder: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Password Reset Request API
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, redirectTo } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectTo || `${req.headers.origin || 'http://localhost:5173'}/`
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, message: 'Password reset link sent to email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SASH Backend Server listening on port ${PORT}`);
  console.log(`🩺 Health check URL: http://localhost:${PORT}/health`);
});
