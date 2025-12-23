# 🔐 Login & Access Control Guide

## 🎯 Complete User Flow & Permissions

---

## 👥 User Roles & Access Levels

### 1. **Admin** (Super User)
- **Email:** Any admin account created in system
- **Access:** EVERYTHING
- **Dashboard:** `/admin`

### 2. **CEO** (Organization Owner)
- **Email:** Organization CEO email
- **Access:** Organization management
- **Dashboard:** `/ceo`

### 3. **User/Employee**
- **Email:** Employee email (invited by CEO)
- **Access:** Survey responses only
- **Dashboard:** `/user`

---

## 🚪 Login Flow

### Step 1: Landing Page
```
User visits: http://localhost:3000/

┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                              │
│                                                              │
│  [Home] [Features] [About] [Contact]        [Sign In] ──┐   │
│                                                          │   │
│  ┌────────────────────────────────────────────────────┐ │   │
│  │  Welcome to Survey Application                     │ │   │
│  │  Professional AI & Humanity Assessment             │ │   │
│  │                                                     │ │   │
│  │  [Get Started] ────────────────────────────────────┼─┘   │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  📊 500+ Organizations  👥 50K+ Surveys  ⭐ 98% Satisfaction │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Clicks "Sign In" or "Get Started"
                              ↓
```

### Step 2: Login Page
```
Redirects to: http://localhost:3000/login

┌─────────────────────────────────────────────────────────────┐
│                      LOGIN PAGE                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Email:    [____________________]                      │ │
│  │  Password: [____________________]                      │ │
│  │                                                         │ │
│  │  [Login] ──────────────────────────────────────────────┼─┐│
│  │                                                         │ ││
│  │  [Forgot Password?]  [Sign Up]                         │ ││
│  └────────────────────────────────────────────────────────┘ ││
└─────────────────────────────────────────────────────────────┘│
                              ↓                                 │
                    User enters credentials                     │
                              ↓                                 │
                    System checks role ◄───────────────────────┘
                              ↓
```

### Step 3: Role-Based Redirect
```
System checks user role and redirects:

┌──────────────────────────────────────────────────────────────┐
│  IF role === 'admin'    → Redirect to /admin                 │
│  IF role === 'ceo'      → Redirect to /ceo                   │
│  IF role === 'user'     → Redirect to /user                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication & Authorization

### JWT Token Flow:

```
1. User logs in with email + password
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token with:
   {
     userId: "...",
     email: "...",
     role: "admin" | "ceo" | "user",
     orgId: "..." (for CEO/User)
   }
   ↓
4. Token sent to client
   ↓
5. Client stores token in localStorage
   ↓
6. Every API request includes token in header:
   Authorization: Bearer <token>
   ↓
7. Server validates token on each request
   ↓
8. Server checks role permissions
   ↓
9. Allow or deny access
```

---

## 📊 Admin Access & Capabilities

### Admin Login:
```
Email: admin@example.com
Password: admin123
```

### Admin Dashboard:
```
URL: http://localhost:3000/admin

┌─────────────────────────────────────────────────────────────┐
│  ☰ SIDEBAR                    ADMIN DASHBOARD               │
│  ├─ Dashboard                                                │
│  ├─ Organizations ──┐         ┌──────────┬──────────┐       │
│  ├─ Templates       │         │ Total    │ Active   │       │
│  ├─ Support         │         │ Orgs: 25 │ Orgs: 20 │       │
│  └─ Logout          │         └──────────┴──────────┘       │
│                     │                                        │
│                     │         ┌──────────┬──────────┐       │
│                     │         │ Total    │ Active   │       │
│                     │         │ Users:500│ Users:450│       │
│                     │         └──────────┴──────────┘       │
│                     │                                        │
│                     │         Recent Activity               │
│                     │         • New org created             │
│                     │         • Survey completed            │
│                     └────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
```

### Admin Can Access:

✅ **Organizations Page** (`/admin/organizations`)
- View all organizations
- See organization stats
- Click to view details

✅ **Organization Details** (`/admin/organizations/:id`)
- View employees
- View departments
- View surveys
- **View Reports** ← Access to scoring system
- See individual user marks

✅ **Reports Page** (`/admin/reports/:orgId`)
- Select survey
- Toggle Present/Future
- View aggregate scores
- See AI & Humanity Matrix
- View individual employee scores with marks
- Download reports

✅ **Templates Page** (`/admin/templates`)
- Create survey templates
- Set marks for each option (0-3)
- Define Present/Future aspects
- Manage question structure

✅ **User Details** (`/admin/users/:userId`)
- View individual employee
- See all their survey responses
- **View marks and scores** (ADMIN ONLY)
- See creativity and morality totals

✅ **Support Panel**
- View all support tickets
- Respond to user/CEO queries
- Update ticket status

---

## 🏢 CEO Access & Capabilities

### CEO Login:
```
Email: ceo@techcorp.com
Password: ceo123
```

### CEO Dashboard:
```
URL: http://localhost:3000/ceo

┌─────────────────────────────────────────────────────────────┐
│  ☰ SIDEBAR                    CEO DASHBOARD                 │
│  ├─ Dashboard                                                │
│  ├─ Employees ──┐             ┌──────────┬──────────┐       │
│  ├─ Departments │             │ Total    │ Active   │       │
│  ├─ Surveys     │             │ Emp: 50  │ Emp: 45  │       │
│  ├─ Analytics   │             └──────────┴──────────┘       │
│  ├─ Help        │                                            │
│  └─ Logout      │             ┌──────────┬──────────┐       │
│                 │             │ Surveys  │ Response │       │
│                 │             │ Active:5 │ Rate: 85%│       │
│                 │             └──────────┴──────────┘       │
│                 │                                            │
│                 │             Department Performance        │
│                 │             • Engineering: 78%            │
│                 │             • Sales: 82%                  │
│                 └────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
```

### CEO Can Access:

✅ **Employees Page** (`/ceo/employees`)
- View all employees in their organization
- Invite new employees
- Manage employee status
- **CANNOT see individual marks**

✅ **Departments Page** (`/ceo/departments`)
- Create departments
- Assign employees
- View department stats

✅ **Surveys Page** (`/ceo/surveys`)
- Create surveys from templates
- Assign surveys to employees
- View survey status
- See completion rates

✅ **Analytics Page** (`/ceo/analytics`)
- View aggregate organization data
- See department comparisons
- View completion trends
- **CANNOT see individual employee scores**

✅ **Help Page** (`/ceo/help`)
- Create support tickets
- Message with admin
- View ticket history

❌ **CEO CANNOT Access:**
- Individual employee marks
- Detailed scoring breakdowns
- Reports with individual scores
- Template mark configuration
- Other organizations' data

---

## 👤 User/Employee Access & Capabilities

### User Login:
```
Email: john.doe@techcorp.com
Password: user123
```

### User Dashboard:
```
URL: http://localhost:3000/user

┌─────────────────────────────────────────────────────────────┐
│  ☰ SIDEBAR                    USER DASHBOARD                │
│  ├─ Dashboard                                                │
│  ├─ Surveys ────┐             Welcome, John Doe!            │
│  ├─ Help        │                                            │
│  └─ Logout      │             ┌──────────┬──────────┐       │
│                 │             │ Assigned │ Completed│       │
│                 │             │ Surveys:3│ Surveys:2│       │
│                 │             └──────────┴──────────┘       │
│                 │                                            │
│                 │             Pending Surveys               │
│                 │             • AI Readiness Q4 [Take Now]  │
│                 │                                            │
│                 │             Completed Surveys             │
│                 │             • Employee Engagement ✓       │
│                 │             • Innovation Assessment ✓     │
│                 └────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘
```

### User Can Access:

✅ **Surveys Page** (`/user/surveys`)
- View assigned surveys
- Take surveys
- See completion status
- **CANNOT see marks or scores**

✅ **Survey Taking** (`/user/survey/:id`)
- Answer questions
- Select options (marks are hidden)
- Save as draft
- Submit final response

✅ **Help Page** (`/user/help`)
- Create support tickets
- Message with admin
- View ticket history

❌ **User CANNOT Access:**
- Their own marks or scores
- Other employees' responses
- Organization-level data
- Survey templates
- Reports or analytics

---

## 🔒 Security & Privacy Implementation

### Route Protection:

```javascript
// In App.js

// Admin-only routes
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminLayout />
  </ProtectedRoute>
} />

// CEO-only routes
<Route path="/ceo/*" element={
  <ProtectedRoute allowedRoles={['ceo']}>
    <CEOLayout />
  </ProtectedRoute>
} />

// User-only routes
<Route path="/user/*" element={
  <ProtectedRoute allowedRoles={['user']}>
    <UserLayout />
  </ProtectedRoute>
} />
```

### Backend Middleware:

```javascript
// In server/middleware/auth.js

// Verify JWT token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is CEO
const isCEO = (req, res, next) => {
  if (req.user.role !== 'ceo') {
    return res.status(403).json({ error: 'CEO access required' });
  }
  next();
};
```

### API Endpoint Protection:

```javascript
// Reports - Admin only
router.get('/reports/organizations/:orgId', auth, isAdmin, getOrgReport);

// User marks - Admin only
router.get('/admin/users/:userId', auth, isAdmin, getUserDetails);

// CEO analytics - CEO only (no individual marks)
router.get('/ceo/analytics', auth, isCEO, getCEOAnalytics);

// User surveys - User only (no marks visible)
router.get('/user/surveys', auth, getUserSurveys);
```

---

## 📊 What Each Role Sees in Reports

### Admin Views Report:
```
┌─────────────────────────────────────────────────────────────┐
│  ORGANIZATION REPORT - Tech Corp Inc.                       │
│                                                              │
│  Aggregate Scores:                                           │
│  • Avg Creativity: 58.5% (Leading)                          │
│  • Avg Morality: 62.3% (Leading)                            │
│                                                              │
│  AI & Humanity Matrix:                                       │
│  [Visual quadrant display with employee counts]             │
│                                                              │
│  Individual Employee Scores: ✅ VISIBLE                      │
│  ┌──────────────┬──────────┬──────────┬─────────────────┐  │
│  │ Employee     │ Creat %  │ Moral %  │ Quadrant        │  │
│  ├──────────────┼──────────┼──────────┼─────────────────┤  │
│  │ John Doe     │  70.0%   │  65.0%   │ Hope in Action  │  │
│  │ Jane Smith   │  45.0%   │  55.0%   │ Safe Stagnation │  │
│  │ Bob Johnson  │  80.0%   │  40.0%   │ Unbounded Power │  │
│  └──────────────┴──────────┴──────────┴─────────────────┘  │
│                                                              │
│  [Download Report] ✅ Available                              │
└─────────────────────────────────────────────────────────────┘
```

### CEO Views Analytics:
```
┌─────────────────────────────────────────────────────────────┐
│  ORGANIZATION ANALYTICS - Tech Corp Inc.                     │
│                                                              │
│  Aggregate Scores:                                           │
│  • Avg Creativity: 58.5% (Leading)                          │
│  • Avg Morality: 62.3% (Leading)                            │
│                                                              │
│  Department Comparison:                                      │
│  • Engineering: 65% avg                                      │
│  • Sales: 72% avg                                            │
│  • Marketing: 58% avg                                        │
│                                                              │
│  Individual Employee Scores: ❌ NOT VISIBLE                  │
│  [Only aggregate data shown]                                 │
│                                                              │
│  [Download Report] ❌ Not available                          │
└─────────────────────────────────────────────────────────────┘
```

### User Views Survey:
```
┌─────────────────────────────────────────────────────────────┐
│  SURVEY: AI Readiness Assessment                             │
│                                                              │
│  Question 1: How does your organization approach AI?         │
│                                                              │
│  Present Creativity:                                         │
│  ○ We avoid AI completely                                    │
│  ○ We use basic automation                                   │
│  ● We experiment with AI tools                               │
│  ○ We innovate with custom AI solutions                      │
│                                                              │
│  [NO MARKS VISIBLE] ❌                                       │
│  [NO SCORES VISIBLE] ❌                                      │
│                                                              │
│  [Submit Survey]                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Scoring Visibility Matrix

| Data Type | Admin | CEO | User |
|-----------|-------|-----|------|
| Survey Questions | ✅ | ✅ | ✅ |
| Option Text | ✅ | ✅ | ✅ |
| **Option Marks** | ✅ | ❌ | ❌ |
| **Individual Scores** | ✅ | ❌ | ❌ |
| **Individual Bands** | ✅ | ❌ | ❌ |
| **Individual Quadrants** | ✅ | ❌ | ❌ |
| Aggregate Scores | ✅ | ✅ | ❌ |
| Aggregate Bands | ✅ | ✅ | ❌ |
| Department Averages | ✅ | ✅ | ❌ |
| Quadrant Distribution | ✅ | ✅ | ❌ |
| Download Reports | ✅ | ❌ | ❌ |

---

## 🔐 Password & Security

### Password Requirements:
- Minimum 6 characters
- Stored as bcrypt hash
- Never stored in plain text

### Session Management:
- JWT tokens expire after 7 days
- Tokens stored in localStorage
- Automatic logout on token expiry
- Refresh required after expiry

### Data Protection:
- Marks encrypted in database
- API endpoints role-protected
- Frontend routes role-protected
- CORS enabled for security

---

## 🚀 Quick Login Reference

### For Testing:

```bash
# Admin Login
Email: admin@example.com
Password: admin123
Access: Everything including reports with individual marks

# CEO Login
Email: ceo@techcorp.com
Password: ceo123
Access: Organization management, aggregate analytics only

# User Login
Email: john.doe@techcorp.com
Password: user123
Access: Assigned surveys only, no marks visible
```

---

## ✅ Summary

**The system determines organization stage based on:**

1. ✅ **Employees take surveys** - Select options (marks hidden)
2. ✅ **System calculates scores** - Using hidden marks (0-3)
3. ✅ **Percentages computed** - (total/max) × 100
4. ✅ **Bands assigned** - Early/Emerging/Leading
5. ✅ **Quadrants determined** - Based on Creativity × Morality
6. ✅ **Aggregated for organization** - Average across all employees
7. ✅ **Admin views reports** - Full access to all data
8. ✅ **CEO sees aggregates only** - No individual marks
9. ✅ **Users see nothing** - Complete privacy

**Goal:** Move organization to **Hope in Action (IGEN Zone)** - High Creativity + High Morality!
