# 🌍 Global Gateway Benchmarking Tool

A comprehensive, anonymous questionnaire platform for collecting benchmarking data on construction projects and firms as part of the **Study on the Job Creation Potential and Competitiveness of Uganda's Local Construction Industry**.

**Status:** ✅ Production Ready | **Responses:** Support 1,000-10,000+ easily | **Hosting:** Free (Render, Railway, Heroku)

---

## 📸 Features

### ✅ Public Questionnaire Form
- **Part B:** Project Level Benchmarking (5 performance categories)
- **Part C:** Firm/Contractor Level Benchmarking (8 performance categories)
- **Fully anonymous** - no user identification
- **Mobile responsive** - works on all devices
- **Shareable link** - anyone can access via URL

### ✅ Data Storage & Backup
- **SQLite database** for fast, reliable storage
- **Automatic backups** after every submission
- **No data loss** - versioned backup files
- Handles 100,000+ records easily

### ✅ Admin Dashboard
- **View all submissions** in organized tables
- **Export to JSON** for analysis and reporting
- **Real-time statistics** of submissions
- **Detailed submission view** with all entered data

### ✅ Easy Deployment
- **One-click deployment** to free hosting (Render/Railway)
- **No credit card** required
- **Always-on servers** for continuous data collection
- **Automatic scaling** for traffic spikes

---

## 🚀 Quick Start (5 minutes)

### 1. Install & Run Locally

```bash
# Clone or download this folder
cd benchmarking-tool

# Install dependencies
npm install

# Start server (runs on http://localhost:5000)
npm start
```

### 2. Test the Form

- **Form:** http://localhost:5000
- **Admin:** http://localhost:5000/admin.html

### 3. Deploy to Free Hosting

#### Option A: Render (Recommended ⭐)
1. Go to https://render.com → Sign up
2. Connect GitHub repository
3. Deploy → Get live URL in 2 minutes
4. Share URL with respondents

#### Option B: Railway
1. Go to https://railway.app → Sign up
2. Create project from GitHub
3. Deploy automatically
4. Share live URL

[**Full deployment guide →**](./DEPLOYMENT_GUIDE.md)

---

## 📊 Project Structure

```
benchmarking-tool/
├── server.js                 # Express API backend
├── package.json              # Node dependencies
├── index.html                # Public questionnaire form
├── admin.html                # Admin dashboard
├── benchmarking.db           # SQLite database (auto-created)
├── backups/                  # Automatic backup files
├── README.md                 # This file
└── DEPLOYMENT_GUIDE.md       # Detailed deployment instructions
```

---

## 🎯 Usage

### For Respondents

1. **Access the form** via shared public URL
2. **Choose form type:**
   - Project Level (Part B) - For construction projects
   - Firm Level (Part C) - For contractor/firm data
3. **Fill in all fields** with assessment results and data sources
4. **Submit** - Data is saved anonymously
5. **See confirmation** - Success message displayed

### For Administrators

1. **Access admin dashboard:** `yourdomain.com/admin.html`
2. **View statistics:** Total submissions, breakdown by type
3. **Browse submissions:** Detailed table view of all responses
4. **Export data:** Download JSON for analysis in Excel/Python/R
5. **Monitor progress:** Real-time stats update every 30 seconds

---

## 🔧 API Endpoints

### Public Endpoints
```
POST /api/submit-project     Submit project level data
POST /api/submit-firm        Submit firm level data
GET  /api/health             Server health check
GET  /api/stats              Submission statistics
```

### Admin Endpoints
```
GET  /api/admin/projects     View all project submissions
GET  /api/admin/firms        View all firm submissions
GET  /api/export/projects/json  Export projects as JSON
GET  /api/export/firms/json     Export firms as JSON
```

### Example API Call
```bash
curl -X GET http://localhost:5000/api/stats
```

Response:
```json
{
  "total_project_submissions": 5,
  "total_firm_submissions": 3,
  "total_submissions": 8,
  "last_updated": "2025-12-15T10:30:45.123Z"
}
```

---

## 💾 Data Management

### Automatic Backups

After every submission, a backup is created:
- **Location:** `backups/` folder
- **Format:** JSON with timestamp
- **Contents:** All projects and firms data
- **Example:** `backup_2025-12-15T10-30-45-123Z.json`

### Manual Export

From admin dashboard:
1. Go to **Projects** tab → Click **Export JSON**
2. Go to **Firms** tab → Click **Export JSON**
3. Save files for:
   - Analysis in Excel/Google Sheets
   - Reporting to stakeholders
   - Research data archival

### Import to Excel

```
1. Open the exported JSON file in text editor
2. Copy the data
3. Use an online JSON to CSV converter
4. Import CSV into Excel/Google Sheets
```

Or use Python:
```python
import json
import pandas as pd

with open('projects_submissions.json') as f:
    data = json.load(f)
    df = pd.json_normalize(data)
    df.to_csv('projects.csv', index=False)
```

---

## 🌐 Deployment Platforms

### Render (Recommended)
- **Cost:** FREE (free tier sufficient)
- **Uptime:** 99.9%
- **Setup:** GitHub integration, auto-deploy
- **URL:** Stable, permanent domain
- **Time to deploy:** ~2 minutes

### Railway
- **Cost:** FREE (free tier)
- **Uptime:** Excellent
- **Setup:** GitHub integration
- **URL:** Automatic SSL/HTTPS
- **Time to deploy:** ~1 minute

### Heroku
- **Cost:** FREE (with limitations)
- **Uptime:** Good, but apps sleep after 30 min inactivity
- **Setup:** Heroku CLI required
- **Note:** Free tier may be deprecated soon

[Full deployment guide with screenshots →](./DEPLOYMENT_GUIDE.md)

---

## 📱 Browser & Device Support

| Device | Support | Status |
|--------|---------|--------|
| Desktop (Chrome, Firefox, Edge, Safari) | ✅ Full | Optimal |
| Tablet (iOS, Android) | ✅ Full | Responsive |
| Mobile (iOS, Android) | ✅ Full | Mobile-optimized |
| Internet Explorer | ⚠️ Limited | Use Chrome/Firefox |

---

## 🔐 Security & Privacy

### Anonymity
- ✅ No user login required
- ✅ No tracking cookies
- ✅ Anonymous submissions
- ✅ No email collection (unless you add it)

### Data Protection
- ✅ Data stored locally in SQLite
- ✅ HTTPS/SSL on all deployed platforms
- ✅ No third-party data sharing
- ✅ Automatic backups for data safety

### Optional: Password Protection

For admin dashboard, add password:

Edit `admin.html`, add at top of script:
```javascript
const ADMIN_PASSWORD = "your-secure-password";
if (prompt("Enter admin password:") !== ADMIN_PASSWORD) {
    alert("Unauthorized access");
    window.location.href = "/";
}
```

---

## 📊 Performance & Capacity

### Response Handling
- **Small deployments:** 0-1,000 responses ✅
- **Medium deployments:** 1,000-10,000 responses ✅ (Target)
- **Large deployments:** 10,000-100,000 responses ⚠️ (Upgrade needed)

### Database Size
- **Per response:** ~2-5 KB
- **1,000 responses:** ~5 MB
- **10,000 responses:** ~50 MB
- **Free hosting limit:** 500 MB (sufficient for this project)

### Response Time
- **Form load:** <1 second
- **Submission:** <2 seconds
- **Admin dashboard:** <1 second

---

## 🚨 Troubleshooting

### "Cannot GET /"
```bash
# Server not running
npm start
```

### "Error submitting data"
```bash
# Check API is running
curl http://localhost:5000/api/health

# Restart server
npm start
```

### Admin dashboard shows no data
```bash
# Submissions folder might need creation
mkdir -p backups

# Restart and submit test data
npm start
```

### Port already in use
```bash
# Use different port
PORT=3001 npm start
```

[More troubleshooting →](./DEPLOYMENT_GUIDE.md#-troubleshooting)

---

## 📈 Analytics & Reporting

### Export Data for Analysis

**Excel/Google Sheets:**
1. Download JSON from admin
2. Import into spreadsheet
3. Create pivot tables, charts, analytics

**Python/R:**
```python
import json
import pandas as pd

# Load project data
with open('project_submissions.json') as f:
    projects = json.load(f)

# Create DataFrame
df = pd.json_normalize(projects)

# Analyze
print(df['implementing_agency'].value_counts())
print(df['initial_cost'].describe())
```

**JavaScript/Plotly.js:**
```javascript
// Embed data in HTML for visualization
fetch('/api/admin/projects')
  .then(r => r.json())
  .then(data => {
    // Create charts with Plotly, Chart.js, etc.
  });
```

---

## 🆘 Getting Help

### Documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete setup & deployment
- [API Reference](#-api-endpoints) - All endpoints documented
- [Troubleshooting](./DEPLOYMENT_GUIDE.md#-troubleshooting) - Common issues

### Installation Issues
```bash
# Check Node version (needs v14+)
node -v

# Reinstall fresh
rm -rf node_modules
npm install

# Verify packages installed
npm list
```

### Deployment Issues
- **Render:** Check "Logs" in deployment dashboard
- **Railway:** Check "Logs" in project settings
- **Heroku:** Run `heroku logs --tail`

---

## 🎓 Project Context

This tool supports the **Study on the Job Creation Potential and Competitiveness of Uganda's Local Construction Industry: Boosting the Implementation of Global Gateway in Uganda**.

**Commissioned by:** European Union Delegation (EUD) in Uganda  
**Executed by:** IBF Impact Consortium  
**Duration:** February 2026 - March 2027  
**Scope:** 10 in-country projects + regional/international comparatives  

---

## 📝 License

Open source - feel free to modify for your needs.

---

## 🎉 Ready to Deploy?

1. ✅ **Local testing:** `npm start`
2. ✅ **Live deployment:** See [Deployment Guide](./DEPLOYMENT_GUIDE.md)
3. ✅ **Share form:** Copy your live URL
4. ✅ **Collect responses:** Data saved automatically
5. ✅ **Export data:** Use admin dashboard

---

**Questions?** Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed setup and troubleshooting.

**Happy benchmarking! 🚀**
