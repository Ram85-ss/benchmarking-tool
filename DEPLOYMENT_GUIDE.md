# Global Gateway Benchmarking Tool - Deployment Guide

## 📋 Table of Contents
1. [Local Setup](#local-setup)
2. [Deploy to Free Hosting](#deploy-to-free-hosting)
3. [Usage](#usage)
4. [Admin Dashboard](#admin-dashboard)
5. [Backup & Data Management](#backup--data-management)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Local Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional but recommended)

### Step 1: Install Dependencies
```bash
cd benchmarking-tool
npm install
```

### Step 2: Start the Server
```bash
npm start
```

Output:
```
🚀 Benchmarking Tool API running on port 5000
```

### Step 3: Access the Application

**Public Form:**
- Open in browser: `http://localhost:5000`
- Share this URL with respondents (for local testing)

**Admin Dashboard:**
- Open in browser: `http://localhost:5000/admin.html`
- View all submissions and export data

### Step 4: Database
- SQLite database automatically created: `benchmarking.db`
- Backups automatically created in `backups/` folder after each submission

---

## ☁️ Deploy to Free Hosting

### Option 1: Deploy to **Render** (Recommended - Easiest)

#### 1. Create Render Account
- Go to: https://render.com
- Sign up with GitHub or Google
- No credit card required for free tier

#### 2. Prepare Repository
If not using Git yet:
```bash
git init
git add .
git commit -m "Initial commit"
```

Push to GitHub (create a new repo on GitHub and push)

#### 3. Deploy on Render
1. Log in to Render dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in deployment details:
   - **Name:** `benchmarking-tool`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Create Web Service**

#### 4. Environment Variables
No variables needed for basic setup! SQLite handles everything.

#### 5. Your Live URL
After deployment, Render will give you a URL like:
```
https://benchmarking-tool-xxxx.onrender.com
```

**Share this URL** with respondents to access the form.

---

### Option 2: Deploy to **Railway** (Also Free)

#### 1. Create Railway Account
- Go to: https://railway.app
- Sign up with GitHub

#### 2. Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your benchmarking-tool repository
4. Configure:
   - **Environment:** Node.js
   - No additional config needed

#### 3. Deploy
Railway automatically deploys when you push to GitHub

Your URL will be something like:
```
https://benchmarking-tool.up.railway.app
```

---

### Option 3: Deploy to **Heroku** (Free tier limited but still works)

#### 1. Create Heroku Account
- Go to: https://www.heroku.com
- Sign up

#### 2. Install Heroku CLI
```bash
# On Mac
brew tap heroku/brew && brew install heroku

# On Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### 3. Deploy
```bash
# Login
heroku login

# Create app
heroku create benchmarking-tool

# Deploy
git push heroku main

# Open app
heroku open
```

---

## 📊 Usage

### For Respondents

#### Step 1: Access Form
Open the public URL: `https://your-domain.com`

#### Step 2: Choose Form Type
- **Project Level Benchmarking (Part B)** - For projects
- **Firm/Contractor Level (Part C)** - For firms

#### Step 3: Fill in Data
- All fields accept standard text input
- Enter percentages as numbers (e.g., `15.5` for 15.5%)
- Both "Assessment Result" and "Data Source" fields should be completed

#### Step 4: Submit
Click **Submit** button to save data

#### Step 5: Confirmation
You'll see a success message. Data is now saved!

### Share the Form
**Copy your live URL and share via:**
- Email: Direct link in email body
- WhatsApp/Telegram: Paste the URL
- QR Code: Generate from https://qr-code-generator.com with your URL
- Social Media: Share the link

---

## 🔐 Admin Dashboard

### Access Admin Panel
Go to: `https://your-domain.com/admin.html`

### Features

#### 1. **Statistics Dashboard**
- Total project submissions
- Total firm submissions
- Total overall responses
- Last update timestamp

#### 2. **View Submissions**
**Projects Tab:**
- See all project submissions in a table
- Filter and search project titles
- View submission date
- Click "View Details" for full data

**Firms Tab:**
- See all firm submissions
- Click "View Details" for complete performance metrics

#### 3. **Export Data**
Click **Export JSON** button to download:
- `project_submissions_YYYY-MM-DD.json` - All project data
- `firm_submissions_YYYY-MM-DD.json` - All firm data

Use these files for:
- Analysis in Excel/Google Sheets
- Creating visualizations
- Backup and archival
- Sharing with research team

#### 4. **Detail View**
Click "View Details" on any submission to see:
- All filled fields
- Assessment results
- Data sources
- Full JSON data

---

## 💾 Backup & Data Management

### Automatic Backups

Backups are created **automatically after every submission**:

**Location:** `backups/` folder

**Filename format:** `backup_2025-12-15T10-30-45-123Z.json`

**Contents:**
- All project submissions
- All firm submissions
- Complete timestamp

### Manual Backup

#### Download via Admin Dashboard
1. Go to admin panel
2. Click **Export JSON** on Projects tab
3. Click **Export JSON** on Firms tab
4. Save both files safely

#### Download Database File
```bash
# Download the SQLite database directly
# Use FTP/SFTP to download: benchmarking.db
```

### Data Restore

If you need to restore from backup:
```bash
# Stop the server
# Delete old database
rm benchmarking.db

# Restore from backup (copy JSON data back)
# Restart server
npm start
```

---

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` file in root directory:

```env
# Server port (default: 5000)
PORT=5000

# Database path (default: ./benchmarking.db)
DATABASE_PATH=./benchmarking.db

# Backup folder path (default: ./backups)
BACKUP_PATH=./backups
```

### Example with Custom Port
```bash
PORT=3000 npm start
```

---

## 📱 Mobile Responsive

The form is **fully responsive** and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones

No special mobile app needed - just access via URL!

---

## 📈 Performance & Limits

### Free Hosting Limits

**Render/Railway Free Tier:**
- Requests per month: Unlimited
- Storage: 500MB (sufficient for ~50,000 responses)
- Uptime: 99.9%
- Auto-sleep: No (stays always on)

**SQLite Database:**
- Can handle: 100,000+ records easily
- For 1,000-10,000 responses: Excellent performance

### Upgrading Storage (If Needed)

If you exceed limits:
1. Export all data as JSON (from admin dashboard)
2. Archive old data
3. Delete old records from database
4. Restart with fresh database

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /"
**Solution:** Server may not be running. Run `npm start`

### Issue: "Error connecting to database"
**Solution:** 
```bash
rm benchmarking.db
npm start
```

### Issue: Form not submitting
**Solution:** 
- Check browser console (F12) for errors
- Ensure server is running
- Check API endpoint: `http://localhost:5000/api/health`

### Issue: Admin dashboard showing "No data"
**Solution:** 
- Submissions may not exist yet
- Refresh the page
- Check that submissions were successful (success message shown)

### Issue: Deploy failed on Render/Railway
**Solution:**
- Check logs in deployment dashboard
- Ensure `package.json` is in root directory
- Run `npm install` locally to verify dependencies work
- Check Node version compatibility

### Issue: Data loss on Heroku (Free tier sleeping)
**Solution:**
- Heroku free tier apps go to sleep after 30 minutes
- Data is NOT lost, but startup takes 30 seconds
- Upgrade to paid tier or use Render/Railway for always-on

---

## 🔐 Security Notes

### Public Form
- Form is **anonymous** - no user tracking
- Respondents can fill multiple times
- No authentication required (as per requirement)

### Admin Dashboard
- Currently **not password protected** (for easy setup)
- For production use, add authentication:

```javascript
// Simple password protection in admin.html (replace with your password)
const ADMIN_PASSWORD = "your-secure-password";
if (prompt("Admin Password:") !== ADMIN_PASSWORD) {
    alert("Unauthorized");
    window.location.href = "/";
}
```

### Data Protection
- All data stored in SQLite (no cloud exposure)
- Backups stored locally
- HTTPS on Render/Railway (automatic SSL)
- No third-party API calls

---

## 📞 Support

### Common Issues
1. **Server won't start** → Check Node.js version: `node -v`
2. **Port already in use** → Change PORT in .env or restart
3. **Admin showing no data** → Check backups folder exists
4. **Deployment failed** → Review error logs in provider dashboard

### Useful Commands

```bash
# Check Node version
node -v

# Check npm version
npm -v

# Reinstall dependencies
rm -rf node_modules
npm install

# View database contents (Linux/Mac)
sqlite3 benchmarking.db

# List backups
ls -la backups/

# View server logs (when deployed)
# Check deployment provider's "Logs" section
```

---

## 🎯 Next Steps

1. ✅ Set up locally
2. ✅ Test the form (fill a test submission)
3. ✅ Verify admin dashboard works
4. ✅ Deploy to free hosting (Render recommended)
5. ✅ Share public URL with respondents
6. ✅ Monitor submissions via admin dashboard
7. ✅ Export data when needed

---

## 📊 Data Collection Timeline

**Suggested workflow:**
- Day 1-2: Set up and test
- Day 3-7: Share form widely
- Week 2-4: Monitor submissions
- Final week: Export all data for analysis

---

**Happy benchmarking! 🚀**
