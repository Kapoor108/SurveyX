# 🔧 MongoDB Connection Issue & Solutions

## 🚨 Current Issue

**Error:** `MongoDB connection error: ETIMEOUT _mongodb._tcp.cluster0.dpyo0v3.mongodb.net`

**Status:** 
- ✅ Server IS running on port 5000
- ✅ API endpoints are accessible
- ❌ MongoDB connection is failing (timeout)

**Impact:** 
- Server runs but database operations will fail
- Login, data fetching, and all DB operations won't work

---

## 🔍 Root Cause

The MongoDB Atlas cluster is either:
1. **Paused** (free tier clusters pause after inactivity)
2. **Network restricted** (IP whitelist doesn't include your current IP)
3. **Connection timeout** (network/firewall issue)

---

## ✅ Solution Options

### Option 1: Use Local MongoDB (Recommended for Development)

#### Step 1: Install MongoDB Locally

**Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a service automatically

**Or use MongoDB Compass (GUI):**
1. Download: https://www.mongodb.com/try/download/compass
2. Install and it will start local MongoDB

#### Step 2: Update .env File

Change the MongoDB URI to local:

```env
# Before (Atlas - timing out)
MONGODB_URI=mongodb+srv://survey:RTMtANjaLVHN3d54@cluster0.dpyo0v3.mongodb.net/surveyapp

# After (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/surveyapp
```

#### Step 3: Restart Server

```bash
# Kill current server
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server again
npm run server
```

**Expected Output:**
```
✓ Server running on port 5000
✓ MongoDB connected
✓ Email server ready
```

---

### Option 2: Fix MongoDB Atlas Connection

#### Step 1: Check if Cluster is Paused

1. Go to https://cloud.mongodb.com/
2. Login with your credentials
3. Check if cluster shows "PAUSED"
4. If paused, click "Resume" button

#### Step 2: Whitelist Your IP Address

1. In MongoDB Atlas dashboard
2. Go to "Network Access" (left sidebar)
3. Click "Add IP Address"
4. Click "Add Current IP Address"
5. Or add `0.0.0.0/0` to allow all IPs (development only!)

#### Step 3: Verify Connection String

1. In Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Update `.env` file with new string
5. Replace `<password>` with actual password

#### Step 4: Restart Server

```bash
npm run server
```

---

### Option 3: Quick Test with In-Memory Database (Temporary)

For quick testing without MongoDB setup:

#### Install mongodb-memory-server:

```bash
npm install mongodb-memory-server --save-dev
```

#### Update server/index.js:

```javascript
// Add at top
const { MongoMemoryServer } = require('mongodb-memory-server');

// Replace MongoDB connection with:
const startServer = async () => {
  // Start in-memory MongoDB
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
  console.log('✓ MongoDB (in-memory) connected');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
};

startServer();
```

**Note:** Data will be lost when server restarts!

---

## 🎯 Recommended Quick Fix

**For immediate testing, use Local MongoDB:**

1. **Update .env:**
```env
MONGODB_URI=mongodb://localhost:27017/surveyapp
```

2. **Install MongoDB:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 mongo`

3. **Restart server:**
```bash
npm run server
```

4. **Seed database (optional):**
```bash
node server/seed.js
```

---

## 🔍 Verify Connection

After fixing, check server output:

```bash
# Should see:
✓ Server running on port 5000
✓ MongoDB connected          ← This line should appear!
✓ Email server ready
```

**Test API:**
```bash
# Should return data (not error)
curl http://localhost:5000/api/health
```

---

## 📝 Current Server Status

```
✅ Server: Running on port 5000
✅ API: Responding to requests
✅ CORS: Configured correctly
✅ Routes: All registered
❌ MongoDB: Connection timeout
```

**Next Step:** Choose one of the solutions above to fix MongoDB connection.

---

## 🚀 After MongoDB is Connected

Once MongoDB is connected, you can:

1. **Seed the database:**
```bash
node server/seed.js
```

2. **Test login:**
   - Visit http://localhost:3000/login
   - Use seeded credentials

3. **Access reports:**
   - Login as admin
   - Go to Organizations
   - Click "View Reports"

---

## 💡 Quick Commands Reference

```bash
# Check if MongoDB is running locally
Get-Service -Name MongoDB

# Start MongoDB service (Windows)
Start-Service MongoDB

# Check server logs
npm run server

# Test API health
Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing

# Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

**Choose Option 1 (Local MongoDB) for fastest setup!**
