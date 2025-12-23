# 🎯 Final Setup Guide - Survey Application

## ✅ Complete Feature List

### 1. Landing Page
- Professional home page at `/`
- Hero section with statistics
- Features, About, Contact sections
- Footer with navigation

### 2. Admin Dashboard
- Left sidebar navigation (collapsible)
- Modern stat cards with gradients
- Support ticket integration
- Recent activity feed

### 3. Survey Template System
- **Present Aspect** (Creativity C, Morality M)
- **Future Aspect** (Creativity C, Morality M)
- 4 option types per question
- Marks stored in database (admin-only visibility)

### 4. Reports System (NEW!)
- Organization-level reports
- Survey-wise breakdown
- **AI & Humanity Matrix** visualization
- Scoring calculation:
  - Creativity & Morality percentages
  - Band classification (Early/Emerging/Leading)
  - Quadrant placement
- Downloadable JSON reports
- Present vs Future scenario toggle

### 5. Help & Support System
- User/CEO ticket creation
- Admin support panel (right slide-in)
- Real-time messaging
- Status tracking

### 6. Organizations Page
- Redesigned card layout
- Circular progress indicators
- Colored status bars
- Stats with icons

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Root directory
npm install

# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Environment Setup

Create `.env` in root directory:
```env
MONGODB_URI=mongodb://localhost:27017/survey-app
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### 4. Access Application

- **Landing Page:** http://localhost:3000/
- **Login:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/admin

## 📊 Reports System Usage

### For Admins:

1. **Navigate to Organization:**
   - Go to Organizations page
   - Click on an organization card

2. **View Reports:**
   - Click "View Reports" button (green button, top right)
   - Select a survey from the list

3. **Toggle Scenarios:**
   - Click "Present Scenario" or "Future Scenario"
   - View aggregate scores and matrix

4. **Download Report:**
   - Click "Download Report" button
   - JSON file will be downloaded

### Scoring System:

**Calculation:**
- Each question has 4 option types (Present C, Present M, Future C, Future M)
- Each option has marks (0-3)
- Total marks = sum of all selected option marks
- Percentage = (total / max_possible) × 100

**Bands:**
- **Early:** 0-39%
- **Emerging:** 40-49%
- **Leading:** 50-100%

**Quadrants:**
- **Hope in Action (IGEN Zone):** High Creativity + High Morality
- **Unbounded Power:** High Creativity + Low Morality
- **Safe Stagnation:** Low Creativity + High Morality
- **Extraction Engine:** Low Creativity + Low Morality

### AI & Humanity Matrix:

```
High Creativity
     ↑
     |  Safe Stagnation  |  Hope in Action
     |    (Orange)       |    (Green)
     |                   |
     |------------------ |------------------
     |                   |
     | Extraction Engine | Unbounded Power
     |     (Red)         |    (Blue)
     |                   |
     └────────────────────────────────────→ High Morality
```

## 🗂️ File Structure

```
project/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.js (Left sidebar)
│   │   │   └── Layout.js (Top navbar)
│   │   ├── pages/
│   │   │   ├── LandingPage.js (NEW)
│   │   │   ├── Help.js (NEW)
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.js (Updated)
│   │   │   │   ├── Organizations.js (Updated)
│   │   │   │   ├── OrgDetails.js (Updated)
│   │   │   │   ├── Templates.js (Updated)
│   │   │   │   ├── UserDetails.js (Updated)
│   │   │   │   └── Reports.js (NEW)
│   │   │   ├── ceo/
│   │   │   └── user/
│   │   ├── App.js (Updated routes)
│   │   └── index.css (Tailwind)
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/
│   ├── models/
│   │   ├── Survey.js (Updated schema)
│   │   └── SupportTicket.js (NEW)
│   ├── routes/
│   │   ├── support.js (NEW)
│   │   └── reports.js (NEW)
│   └── index.js (Updated)
└── README.md
```

## 🎨 Design System

### Colors:
- **Primary:** Indigo (#4F46E5) to Purple (#9333EA)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B) / Orange (#F97316)
- **Danger:** Red (#EF4444)
- **Info:** Blue (#3B82F6)

### Quadrant Colors:
- **Hope in Action:** Green (#10B981)
- **Unbounded Power:** Blue (#3B82F6)
- **Safe Stagnation:** Orange (#F97316)
- **Extraction Engine:** Red (#EF4444)

## 🔐 Security

### Access Control:
- **Admin Only:**
  - User details with marks
  - Reports system
  - Support ticket management
  - Template management

- **CEO:**
  - Organization management
  - Survey creation
  - Employee management
  - Aggregate analytics (no individual marks)

- **User:**
  - Survey responses
  - Own dashboard
  - Help/Support tickets

## 📝 API Endpoints

### Reports:
- `GET /api/reports/organizations/:orgId` - Get organization report
- `GET /api/reports/surveys/:surveyId` - Get survey report

### Support:
- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets` - Get user tickets
- `GET /api/support/tickets/:id` - Get ticket details
- `POST /api/support/tickets/:id/messages` - Add message
- `GET /api/support/admin/tickets` - Get all tickets (admin)
- `PATCH /api/support/admin/tickets/:id` - Update ticket (admin)

## 🐛 Troubleshooting

### Issue: Changes not visible
**Solution:**
1. Hard refresh: `Ctrl + Shift + R`
2. Clear cache: `Ctrl + Shift + Delete`
3. Restart both servers
4. Try incognito window

### Issue: Tailwind styles not working
**Solution:**
1. Verify `tailwind.config.js` exists in client folder
2. Verify `postcss.config.js` exists in client folder
3. Verify `index.css` has Tailwind directives
4. Restart client server

### Issue: Reports not loading
**Solution:**
1. Ensure MongoDB is running
2. Check server console for errors
3. Verify reports route is registered
4. Check browser console for API errors

### Issue: Scores showing as 0
**Solution:**
1. Ensure survey responses exist
2. Check that survey uses new template structure (Present/Future aspects)
3. Verify option marks are set in template
4. Check server logs for calculation errors

## ✨ Key Features

### Reports Page:
✅ Organization-level overview
✅ Survey selection dropdown
✅ Present/Future scenario toggle
✅ Aggregate scores display
✅ AI & Humanity Matrix visualization
✅ Individual employee scores table
✅ Band classification
✅ Quadrant distribution
✅ Downloadable JSON reports
✅ Moving to Top Right guide

### Scoring System:
✅ Hidden marks (admin-only)
✅ Automatic calculation
✅ Percentage-based scoring
✅ Band classification (Early/Emerging/Leading)
✅ Quadrant placement
✅ Present vs Future comparison

## 🎯 Testing Checklist

- [ ] Landing page loads at `/`
- [ ] Admin can login and see dashboard
- [ ] Organizations page shows new design
- [ ] Templates show Present/Future aspects
- [ ] Admin can create organization
- [ ] CEO can create surveys
- [ ] Users can submit surveys
- [ ] **Reports page loads for organization**
- [ ] **Scores calculate correctly**
- [ ] **Matrix visualization displays**
- [ ] **Download report works**
- [ ] **Present/Future toggle works**
- [ ] Support tickets work
- [ ] Help page accessible

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check server console for errors
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Clear browser cache
6. Restart servers

## 🎉 You're All Set!

The application is now fully functional with:
- Professional landing page
- Modern admin dashboard
- Comprehensive reports system
- AI & Humanity Matrix visualization
- Support ticket system
- Secure access control

Navigate to http://localhost:3000/ to get started!
