# 🚀 Quick Start Guide

## ✅ Current Status

**Backend:** ✅ Running on port 5000
**MongoDB:** ✅ Connected (local)
**Frontend:** ⏳ Ready to start

---

## 🎯 Start the Application (2 Steps)

### Step 1: Backend is Already Running ✅

The backend server is currently running with:
```
✓ Server running on port 5000
✓ MongoDB connected
✓ Email server ready
```

**If you need to restart it:**
```bash
npm run server
```

---

### Step 2: Start the Frontend

Open a **NEW terminal** and run:

```bash
npm run client
```

**Expected output:**
```
Compiled successfully!
You can now view client in the browser.
  Local:            http://localhost:3000
```

---

## 🌐 Access the Application

Once both are running:

1. **Landing Page:** http://localhost:3000/
2. **Login Page:** http://localhost:3000/login
3. **Sign Up:** http://localhost:3000/signup

---

## 👤 Test Accounts

### Option 1: Create New Account
1. Go to http://localhost:3000/signup
2. Fill in the form
3. Create your account

### Option 2: Seed Database (Recommended)

Run this to create test accounts:
```bash
node server/seed.js
```

This creates:
- **Admin account** - Full access to reports
- **CEO account** - Organization management
- **User accounts** - Survey responses
- **Sample surveys** - With marks configured

---

## 📊 Test the Reports System

### As Admin:

1. **Login** at http://localhost:3000/login
2. **Go to Organizations** page
3. **Click on an organization** card
4. **Click "View Reports"** button (green, top right)
5. **Select a survey** from the list
6. **Toggle** between Present/Future scenarios
7. **View** the AI & Humanity Matrix
8. **Download** the report (JSON)

---

## 🎨 What You'll See

### Landing Page:
- Professional hero section
- Features showcase
- About section
- Contact form
- Footer

### Admin Dashboard:
- Left sidebar navigation
- Stats cards with gradients
- Support ticket panel
- Recent activity

### Reports Page:
- Survey selector
- Present/Future toggle
- Aggregate scores (color-coded)
- AI & Humanity Matrix (4 quadrants)
- Individual employee scores table
- Download button

---

## 🔍 Verify Everything is Working

### Test 1: Backend Health
```bash
Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing
```
**Expected:** `{"status":"ok","timestamp":"..."}`

### Test 2: Frontend Loading
Visit http://localhost:3000/
**Expected:** Landing page with navigation

### Test 3: API Connection
Open browser console (F12) and check for:
- No CORS errors
- No connection refused errors
- API calls succeeding

---

## 🐛 If Something Goes Wrong

### Frontend Won't Start:
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Backend Connection Error:
```bash
# Restart backend
Get-Process -Name node | Stop-Process -Force
npm run server
```

### MongoDB Not Connected:
```bash
# Check MongoDB service
Get-Service -Name MongoDB

# Start if stopped
Start-Service MongoDB
```

### Clear Browser Cache:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh: `Ctrl + Shift + R`

---

## 📚 Understanding the Scoring System

### How It Works:

1. **Employees take surveys** - Select options (marks hidden)
2. **System calculates scores** - Each option has marks (0-3)
3. **Percentages computed** - (total/max) × 100
4. **Bands assigned** - Early (0-39%), Emerging (40-49%), Leading (50-100%)
5. **Quadrants determined** - Based on Creativity × Morality
6. **Reports generated** - Admin can view and download

### The Matrix:

```
        High Creativity
             ↑
             |
  Orange     |     Green
  Safe       |     Hope in Action
  Stagnation |     (TARGET)
  ───────────┼───────────
  Red        |     Blue
  Extraction |     Unbounded
  Engine     |     Power
             |
             └──────────→ High Morality
```

**Goal:** Get organization to Green quadrant (Hope in Action)

---

## 🎯 Quick Test Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Frontend running on port 3000
- [ ] Landing page loads
- [ ] Can navigate to login
- [ ] No console errors
- [ ] Can create account or login
- [ ] Dashboard loads after login
- [ ] Can access reports (admin only)

---

## 💡 Pro Tips

1. **Use Chrome DevTools** (F12) to debug API calls
2. **Check Network tab** for failed requests
3. **Check Console tab** for JavaScript errors
4. **Use Incognito mode** if cache issues persist
5. **Keep both terminals open** to see logs

---

## 📞 Need Help?

Check these documents:
- **CONNECTION_STATUS.md** - Current system status
- **SCORING_LOGIC_EXPLAINED.md** - How scoring works
- **LOGIN_AND_ACCESS_GUIDE.md** - User roles & permissions
- **MONGODB_CONNECTION_FIX.md** - Database setup
- **TROUBLESHOOTING_FIXED.md** - Common issues

---

## 🎉 You're Ready!

**Backend:** ✅ Running
**MongoDB:** ✅ Connected
**Frontend:** ⏳ Start with `npm run client`

**Next:** Open http://localhost:3000/ and explore!
