import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('.'));

// Create backups directory
if (!fs.existsSync('backups')) {
  fs.mkdirSync('backups');
}

// Database initialization
const db = new sqlite3.Database('./benchmarking.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

    // Drafts table
    db.run(`
      CREATE TABLE IF NOT EXISTS project_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        draft_id TEXT UNIQUE,
        project_data JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating project_drafts table:', err);
      else console.log('project_drafts table ready');
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS firm_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        draft_id TEXT UNIQUE,
        firm_data JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating firm_drafts table:', err);
      else console.log('firm_drafts table ready');
    });

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Project level data table
    db.run(`
      CREATE TABLE IF NOT EXISTS project_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        project_id TEXT,
        project_title TEXT,
        implementing_agency TEXT,
        funding_agency TEXT,
        implementing_firm TEXT,
        initial_cost TEXT,
        start_date TEXT,
        duration TEXT,
        cost_performance JSON,
        schedule_performance JSON,
        quality_performance JSON,
        local_content_performance JSON,
        safety_env_performance JSON,
        submission_type TEXT
      )
    `, (err) => {
      if (err) console.error('Error creating project_submissions table:', err);
      else console.log('project_submissions table ready');
    });

    // Firm level data table
    db.run(`
      CREATE TABLE IF NOT EXISTS firm_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        firm_name TEXT,
        financial_performance JSON,
        competitiveness JSON,
        customer_satisfaction JSON,
        technology_advancement JSON,
        communication_framework JSON,
        collaboration JSON,
        employee_satisfaction JSON,
        product_orientation JSON
      )
    `, (err) => {
      if (err) console.error('Error creating firm_submissions table:', err);
      else console.log('firm_submissions table ready');
    });
  });
}

// ============ API ENDPOINTS ============

// Save Project Draft
app.post('/api/save-project-draft', (req, res) => {
  const { draft_id, project_data } = req.body;
  const query = `INSERT INTO project_drafts (draft_id, project_data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(draft_id) DO UPDATE SET project_data = excluded.project_data, updated_at = CURRENT_TIMESTAMP`;
  db.run(query, [draft_id, JSON.stringify(project_data)], function(err) {
    if (err) { res.status(500).json({ error: 'Failed to save draft' }); }
    else { res.status(200).json({ success: true, draft_id: draft_id, message: 'Draft saved' }); }
  });
});

app.get('/api/load-project-draft/:draft_id', (req, res) => {
  db.get('SELECT * FROM project_drafts WHERE draft_id = ?', [req.params.draft_id], (err, row) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else if (row) { res.json({ success: true, draft_id: row.draft_id, project_data: JSON.parse(row.project_data), saved_at: row.updated_at }); }
    else { res.status(404).json({ error: 'Draft not found' }); }
  });
});

app.post('/api/save-firm-draft', (req, res) => {
  const { draft_id, firm_data } = req.body;
  const query = `INSERT INTO firm_drafts (draft_id, firm_data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(draft_id) DO UPDATE SET firm_data = excluded.firm_data, updated_at = CURRENT_TIMESTAMP`;
  db.run(query, [draft_id, JSON.stringify(firm_data)], function(err) {
    if (err) { res.status(500).json({ error: 'Failed to save draft' }); }
    else { res.status(200).json({ success: true, draft_id: draft_id, message: 'Draft saved' }); }
  });
});

app.get('/api/load-firm-draft/:draft_id', (req, res) => {
  db.get('SELECT * FROM firm_drafts WHERE draft_id = ?', [req.params.draft_id], (err, row) => {
    if (err) { res.status(500).json({ error: err.message }); }
    else if (row) { res.json({ success: true, draft_id: row.draft_id, firm_data: JSON.parse(row.firm_data), saved_at: row.updated_at }); }
    else { res.status(404).json({ error: 'Draft not found' }); }
  });
});

// Submit Project Level Data
app.post('/api/submit-project', (req, res) => {
  const {
    project_id,
    project_title,
    implementing_agency,
    funding_agency,
    implementing_firm,
    initial_cost,
    start_date,
    duration,
    cost_performance,
    schedule_performance,
    quality_performance,
    local_content_performance,
    safety_env_performance
  } = req.body;

  const query = `
    INSERT INTO project_submissions (
      project_id, project_title, implementing_agency, funding_agency,
      implementing_firm, initial_cost, start_date, duration,
      cost_performance, schedule_performance, quality_performance,
      local_content_performance, safety_env_performance, submission_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    project_id,
    project_title,
    implementing_agency,
    funding_agency,
    implementing_firm,
    initial_cost,
    start_date,
    duration,
    JSON.stringify(cost_performance),
    JSON.stringify(schedule_performance),
    JSON.stringify(quality_performance),
    JSON.stringify(local_content_performance),
    JSON.stringify(safety_env_performance),
    'project'
  ], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to submit project data' });
    } else {
      res.status(201).json({ 
        success: true, 
        id: this.lastID,
        message: 'Project data submitted successfully'
      });
      // Auto backup after submission
      createBackup();
    }
  });
});

// Submit Firm Level Data
app.post('/api/submit-firm', (req, res) => {
  const {
    firm_name,
    financial_performance,
    competitiveness,
    customer_satisfaction,
    technology_advancement,
    communication_framework,
    collaboration,
    employee_satisfaction,
    product_orientation
  } = req.body;

  const query = `
    INSERT INTO firm_submissions (
      firm_name, financial_performance, competitiveness, customer_satisfaction,
      technology_advancement, communication_framework, collaboration,
      employee_satisfaction, product_orientation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    firm_name,
    JSON.stringify(financial_performance),
    JSON.stringify(competitiveness),
    JSON.stringify(customer_satisfaction),
    JSON.stringify(technology_advancement),
    JSON.stringify(communication_framework),
    JSON.stringify(collaboration),
    JSON.stringify(employee_satisfaction),
    JSON.stringify(product_orientation)
  ], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to submit firm data' });
    } else {
      res.status(201).json({ 
        success: true, 
        id: this.lastID,
        message: 'Firm data submitted successfully'
      });
      createBackup();
    }
  });
});

// Get all project submissions (for admin)
app.get('/api/admin/projects', (req, res) => {
  db.all('SELECT * FROM project_submissions ORDER BY submission_date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Parse JSON fields
      const parsed = rows.map(row => ({
        ...row,
        cost_performance: JSON.parse(row.cost_performance),
        schedule_performance: JSON.parse(row.schedule_performance),
        quality_performance: JSON.parse(row.quality_performance),
        local_content_performance: JSON.parse(row.local_content_performance),
        safety_env_performance: JSON.parse(row.safety_env_performance)
      }));
      res.json(parsed);
    }
  });
});

// Get all firm submissions (for admin)
app.get('/api/admin/firms', (req, res) => {
  db.all('SELECT * FROM firm_submissions ORDER BY submission_date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const parsed = rows.map(row => ({
        ...row,
        financial_performance: JSON.parse(row.financial_performance),
        competitiveness: JSON.parse(row.competitiveness),
        customer_satisfaction: JSON.parse(row.customer_satisfaction),
        technology_advancement: JSON.parse(row.technology_advancement),
        communication_framework: JSON.parse(row.communication_framework),
        collaboration: JSON.parse(row.collaboration),
        employee_satisfaction: JSON.parse(row.employee_satisfaction),
        product_orientation: JSON.parse(row.product_orientation)
      }));
      res.json(parsed);
    }
  });
});

// Export project data as JSON
app.get('/api/export/projects/json', (req, res) => {
  db.all('SELECT * FROM project_submissions ORDER BY submission_date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const parsed = rows.map(row => ({
        ...row,
        cost_performance: JSON.parse(row.cost_performance),
        schedule_performance: JSON.parse(row.schedule_performance),
        quality_performance: JSON.parse(row.quality_performance),
        local_content_performance: JSON.parse(row.local_content_performance),
        safety_env_performance: JSON.parse(row.safety_env_performance)
      }));
      res.setHeader('Content-Disposition', 'attachment; filename="project_submissions.json"');
      res.json(parsed);
    }
  });
});

// Export firm data as JSON
app.get('/api/export/firms/json', (req, res) => {
  db.all('SELECT * FROM firm_submissions ORDER BY submission_date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const parsed = rows.map(row => ({
        ...row,
        financial_performance: JSON.parse(row.financial_performance),
        competitiveness: JSON.parse(row.competitiveness),
        customer_satisfaction: JSON.parse(row.customer_satisfaction),
        technology_advancement: JSON.parse(row.technology_advancement),
        communication_framework: JSON.parse(row.communication_framework),
        collaboration: JSON.parse(row.collaboration),
        employee_satisfaction: JSON.parse(row.employee_satisfaction),
        product_orientation: JSON.parse(row.product_orientation)
      }));
      res.setHeader('Content-Disposition', 'attachment; filename="firm_submissions.json"');
      res.json(parsed);
    }
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  db.all('SELECT COUNT(*) as count FROM project_submissions', (err, rows) => {
    const projectCount = rows[0]?.count || 0;
    
    db.all('SELECT COUNT(*) as count FROM firm_submissions', (err, rows) => {
      const firmCount = rows[0]?.count || 0;
      
      res.json({
        total_project_submissions: projectCount,
        total_firm_submissions: firmCount,
        total_submissions: projectCount + firmCount,
        last_updated: new Date().toISOString()
      });
    });
  });
});
// Save Project Draft
app.post('/api/save-project-draft', (req, res) => {
  const { draft_id, project_data } = req.body;

  const query = `
    INSERT INTO project_drafts (draft_id, project_data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(draft_id) DO UPDATE SET
      project_data = excluded.project_data,
      updated_at = CURRENT_TIMESTAMP
  `;

  db.run(query, [draft_id, JSON.stringify(project_data)], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save draft' });
    } else {
      res.status(200).json({ 
        success: true, 
        draft_id: draft_id,
        message: 'Draft saved successfully'
      });
    }
  });
});

// Load Project Draft
app.get('/api/load-project-draft/:draft_id', (req, res) => {
  const { draft_id } = req.params;

  db.get('SELECT * FROM project_drafts WHERE draft_id = ?', [draft_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json({
        success: true,
        draft_id: row.draft_id,
        project_data: JSON.parse(row.project_data),
        saved_at: row.updated_at
      });
    } else {
      res.status(404).json({ error: 'Draft not found' });
    }
  });
});

// Save Firm Draft
app.post('/api/save-firm-draft', (req, res) => {
  const { draft_id, firm_data } = req.body;

  const query = `
    INSERT INTO firm_drafts (draft_id, firm_data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(draft_id) DO UPDATE SET
      firm_data = excluded.firm_data,
      updated_at = CURRENT_TIMESTAMP
  `;

  db.run(query, [draft_id, JSON.stringify(firm_data)], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save draft' });
    } else {
      res.status(200).json({ 
        success: true, 
        draft_id: draft_id,
        message: 'Draft saved successfully'
      });
    }
  });
});

// Load Firm Draft
app.get('/api/load-firm-draft/:draft_id', (req, res) => {
  const { draft_id } = req.params;

  db.get('SELECT * FROM firm_drafts WHERE draft_id = ?', [draft_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json({
        success: true,
        draft_id: row.draft_id,
        firm_data: JSON.parse(row.firm_data),
        saved_at: row.updated_at
      });
    } else {
      res.status(404).json({ error: 'Draft not found' });
    }
  });
});
// Backup function
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backups/backup_${timestamp}.json`;

  db.all('SELECT * FROM project_submissions', (err, projects) => {
    if (err) return;

    db.all('SELECT * FROM firm_submissions', (err, firms) => {
      if (err) return;

      const backup = {
        timestamp: new Date().toISOString(),
        projects: projects.map(p => ({
          ...p,
          cost_performance: JSON.parse(p.cost_performance),
          schedule_performance: JSON.parse(p.schedule_performance),
          quality_performance: JSON.parse(p.quality_performance),
          local_content_performance: JSON.parse(p.local_content_performance),
          safety_env_performance: JSON.parse(p.safety_env_performance)
        })),
        firms: firms.map(f => ({
          ...f,
          financial_performance: JSON.parse(f.financial_performance),
          competitiveness: JSON.parse(f.competitiveness),
          customer_satisfaction: JSON.parse(f.customer_satisfaction),
          technology_advancement: JSON.parse(f.technology_advancement),
          communication_framework: JSON.parse(f.communication_framework),
          collaboration: JSON.parse(f.collaboration),
          employee_satisfaction: JSON.parse(f.employee_satisfaction),
          product_orientation: JSON.parse(f.product_orientation)
        }))
      };

      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`Backup created: ${backupFile}`);
    });
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Benchmarking Tool API running on port ${PORT}`);
  console.log(`📊 Admin endpoints:`);
  console.log(`   GET /api/admin/projects - View all project submissions`);
  console.log(`   GET /api/admin/firms - View all firm submissions`);
  console.log(`   GET /api/export/projects/json - Export projects as JSON`);
  console.log(`   GET /api/export/firms/json - Export firms as JSON`);
  console.log(`   GET /api/stats - View submission statistics`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  db.close();
  process.exit(0);
});
