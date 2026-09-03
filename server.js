const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// SQLite Database Setup
const db = new sqlite3.Database('./benchmarking.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database');
});

// Initialize Database Tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    organization TEXT,
    country TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
  )`);

  // Project Submissions
  db.run(`CREATE TABLE IF NOT EXISTS project_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id TEXT,
    project_title TEXT,
    implementing_agency TEXT,
    funding_agency TEXT,
    implementing_firm TEXT,
    initial_cost TEXT,
    start_date TEXT,
    duration TEXT,
    cost_performance TEXT,
    schedule_performance TEXT,
    quality_performance TEXT,
    local_content_performance TEXT,
    safety_env_performance TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  )`);

  // Firm Submissions
  db.run(`CREATE TABLE IF NOT EXISTS firm_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    firm_name TEXT,
    financial_performance TEXT,
    competitiveness TEXT,
    customer_satisfaction TEXT,
    technology_advancement TEXT,
    communication_framework TEXT,
    collaboration TEXT,
    employee_satisfaction TEXT,
    product_orientation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  )`);

  // Project Drafts
  db.run(`CREATE TABLE IF NOT EXISTS project_drafts (
    draft_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    project_data TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  )`);

  // Firm Drafts
  db.run(`CREATE TABLE IF NOT EXISTS firm_drafts (
    draft_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    firm_data TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
  )`);

  console.log('✅ All database tables ready');
});

// ============ MIDDLEWARE ============
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTHENTICATION ENDPOINTS ============
app.post('/api/register', async (req, res) => {
  const { username, email, password, organization, country } = req.body;

  if (!username || !email || !password || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const query = `INSERT INTO users (username, email, password_hash, organization, country) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [username, email, hashedPassword, organization, country], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }

      const token = jwt.sign({ user_id: this.lastID, username, email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({ success: true, message: 'Registration successful', token, user_id: this.lastID, username });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    try {
      const passwordMatch = await bcryptjs.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);

      const token = jwt.sign({ user_id: user.user_id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(200).json({ success: true, message: 'Login successful', token, user_id: user.user_id, username: user.username, organization: user.organization, country: user.country });
    } catch (error) {
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  });
});

app.get('/api/user/profile', verifyToken, (req, res) => {
  db.get('SELECT user_id, username, email, organization, country, created_at FROM users WHERE user_id = ?', [req.user.user_id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// ============ SUBMISSION ENDPOINTS ============
app.post('/api/submit-project', verifyToken, (req, res) => {
  const { project_id, project_title, implementing_agency, funding_agency, implementing_firm, initial_cost, start_date, duration, cost_performance, schedule_performance, quality_performance, local_content_performance, safety_env_performance } = req.body;

  const query = `INSERT INTO project_submissions (user_id, project_id, project_title, implementing_agency, funding_agency, implementing_firm, initial_cost, start_date, duration, cost_performance, schedule_performance, quality_performance, local_content_performance, safety_env_performance) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [req.user.user_id, project_id, project_title, implementing_agency, funding_agency, implementing_firm, initial_cost, start_date, duration, JSON.stringify(cost_performance), JSON.stringify(schedule_performance), JSON.stringify(quality_performance), JSON.stringify(local_content_performance), JSON.stringify(safety_env_performance)], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Submission failed: ' + err.message });
    }
    res.status(200).json({ success: true, message: 'Project submitted successfully', submission_id: this.lastID });
  });
});

app.post('/api/submit-firm', verifyToken, (req, res) => {
  const { firm_name, financial_performance, competitiveness, customer_satisfaction, technology_advancement, communication_framework, collaboration, employee_satisfaction, product_orientation } = req.body;

  const query = `INSERT INTO firm_submissions (user_id, firm_name, financial_performance, competitiveness, customer_satisfaction, technology_advancement, communication_framework, collaboration, employee_satisfaction, product_orientation) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [req.user.user_id, firm_name, JSON.stringify(financial_performance), JSON.stringify(competitiveness), JSON.stringify(customer_satisfaction), JSON.stringify(technology_advancement), JSON.stringify(communication_framework), JSON.stringify(collaboration), JSON.stringify(employee_satisfaction), JSON.stringify(product_orientation)], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Submission failed: ' + err.message });
    }
    res.status(200).json({ success: true, message: 'Firm submitted successfully', submission_id: this.lastID });
  });
});

// ============ DRAFT ENDPOINTS ============
app.post('/api/save-project-draft', verifyToken, (req, res) => {
  const { draft_id, project_data } = req.body;
  const query = `INSERT INTO project_drafts (draft_id, user_id, project_data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(draft_id) DO UPDATE SET project_data = excluded.project_data, updated_at = CURRENT_TIMESTAMP`;
  
  db.run(query, [draft_id, req.user.user_id, JSON.stringify(project_data)], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save draft' });
    }
    res.status(200).json({ success: true, draft_id: draft_id, message: 'Draft saved' });
  });
});

app.post('/api/save-firm-draft', verifyToken, (req, res) => {
  const { draft_id, firm_data } = req.body;
  const query = `INSERT INTO firm_drafts (draft_id, user_id, firm_data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(draft_id) DO UPDATE SET firm_data = excluded.firm_data, updated_at = CURRENT_TIMESTAMP`;
  
  db.run(query, [draft_id, req.user.user_id, JSON.stringify(firm_data)], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save draft' });
    }
    res.status(200).json({ success: true, draft_id: draft_id, message: 'Draft saved' });
  });
});

app.get('/api/load-project-draft/:draft_id', verifyToken, (req, res) => {
  db.get('SELECT * FROM project_drafts WHERE draft_id = ? AND user_id = ?', [req.params.draft_id, req.user.user_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ success: true, draft_id: row.draft_id, project_data: JSON.parse(row.project_data), saved_at: row.updated_at });
    } else {
      res.status(404).json({ error: 'Draft not found or unauthorized' });
    }
  });
});

app.get('/api/load-firm-draft/:draft_id', verifyToken, (req, res) => {
  db.get('SELECT * FROM firm_drafts WHERE draft_id = ? AND user_id = ?', [req.params.draft_id, req.user.user_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({ success: true, draft_id: row.draft_id, firm_data: JSON.parse(row.firm_data), saved_at: row.updated_at });
    } else {
      res.status(404).json({ error: 'Draft not found or unauthorized' });
    }
  });
});

app.get('/api/user/project-drafts', verifyToken, (req, res) => {
  db.all('SELECT draft_id, updated_at FROM project_drafts WHERE user_id = ? ORDER BY updated_at DESC', [req.user.user_id], (err, drafts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, drafts: drafts || [] });
  });
});

app.get('/api/user/firm-drafts', verifyToken, (req, res) => {
  db.all('SELECT draft_id, updated_at FROM firm_drafts WHERE user_id = ? ORDER BY updated_at DESC', [req.user.user_id], (err, drafts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, drafts: drafts || [] });
  });
});

// ============ ADMIN ENDPOINTS (NO AUTH - KEPT PUBLIC) ============
app.get('/api/admin/projects', (req, res) => {
  db.all(`SELECT p.id, u.username, p.project_id, p.project_title, p.implementing_agency, p.funding_agency, p.implementing_firm, p.initial_cost, p.start_date, p.duration, p.cost_performance, p.schedule_performance, p.quality_performance, p.local_content_performance, p.safety_env_performance, p.submission_date 
          FROM project_submissions p 
          JOIN users u ON p.user_id = u.user_id 
          ORDER BY p.submission_date DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

app.get('/api/admin/firms', (req, res) => {
  db.all(`SELECT f.id, u.username, f.firm_name, f.submission_date 
          FROM firm_submissions f 
          JOIN users u ON f.user_id = u.user_id 
          ORDER BY f.submission_date DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

app.get('/api/stats', (req, res) => {
  db.all('SELECT COUNT(*) as count FROM project_submissions', (err, projectCount) => {
    db.all('SELECT COUNT(*) as count FROM firm_submissions', (err, firmCount) => {
      res.json({
        project_submissions: projectCount?.[0]?.count || 0,
        firm_submissions: firmCount?.[0]?.count || 0,
        total_responses: (projectCount?.[0]?.count || 0) + (firmCount?.[0]?.count || 0),
        last_updated: new Date().toLocaleString()
      });
    });
  });
});

app.get('/api/export/projects/json', (req, res) => {
  db.all(`SELECT u.username, u.email, u.organization, u.country, p.* 
          FROM project_submissions p 
          JOIN users u ON p.user_id = u.user_id 
          ORDER BY p.submission_date DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const parsed = rows.map(row => ({
      ...row,
      cost_performance: JSON.parse(row.cost_performance || '{}'),
      schedule_performance: JSON.parse(row.schedule_performance || '{}'),
      quality_performance: JSON.parse(row.quality_performance || '{}'),
      local_content_performance: JSON.parse(row.local_content_performance || '{}'),
      safety_env_performance: JSON.parse(row.safety_env_performance || '{}')
    }));
    res.json(parsed);
  });
});

app.get('/api/export/firms/json', (req, res) => {
  db.all(`SELECT u.username, u.email, u.organization, u.country, f.* 
          FROM firm_submissions f 
          JOIN users u ON f.user_id = u.user_id 
          ORDER BY f.submission_date DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const parsed = rows.map(row => ({
      ...row,
      financial_performance: JSON.parse(row.financial_performance || '{}'),
      competitiveness: JSON.parse(row.competitiveness || '{}'),
      customer_satisfaction: JSON.parse(row.customer_satisfaction || '{}'),
      technology_advancement: JSON.parse(row.technology_advancement || '{}'),
      communication_framework: JSON.parse(row.communication_framework || '{}'),
      collaboration: JSON.parse(row.collaboration || '{}'),
      employee_satisfaction: JSON.parse(row.employee_satisfaction || '{}'),
      product_orientation: JSON.parse(row.product_orientation || '{}')
    }));
    res.json(parsed);
  });
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Benchmarking Tool API running on port ${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin.html`);
});
