# 🔑 Login Credentials

## ✅ Database Seeded Successfully

The database has been populated with test accounts. Use these credentials to login:

---

## 👤 Test Accounts

### 1. ADMIN Account (Full Access)
```
Email:    hkapoor@1gen.io
Password: 123456Harsh
Role:     admin
```

**Access:**
- ✅ All organizations
- ✅ Reports with individual marks
- ✅ User details with scores
- ✅ Template management
- ✅ Support tickets
- ✅ Download reports

---

### 2. CEO Account (Organization Management)
```
Email:    ceo@mailto.plus
Password: Ceo@123456
Role:     ceo
```

**Access:**
- ✅ Employee management
- ✅ Department creation
- ✅ Survey creation
- ✅ Aggregate analytics
- ❌ Cannot see individual marks
- ❌ Cannot access reports page

---

### 3. USER Account (Survey Responses)
```
Email:    user@mailto.plus
Password: User@123456
Role:     user
```

**Access:**
- ✅ Take assigned surveys
- ✅ Submit responses
- ✅ Create support tickets
- ❌ Cannot see marks or scores
- ❌ Cannot see other users' data

---

## 🚀 How to Login

### Step 1: Go to Login Page
Visit: http://localhost:3000/login

### Step 2: Enter Email
Enter one of the emails above (e.g., `hkapoor@1gen.io`)

### Step 3: Click "Send OTP"
The system will send an OTP to the email

### Step 4: Check Console/Email
- **Development Mode:** OTP is logged to server console
- **Production:** OTP sent to actual email

### Step 5: Enter OTP
Enter the 6-digit OTP code

### Step 6: Access Dashboard
You'll be redirected to the appropriate dashboard based on your role

---

## 📧 Getting the OTP

### Option 1: Check Server Console (Recommended for Testing)

The OTP is printed in the server terminal:

```
✓ Email server ready
OTP for hkapoor@1gen.io: 123456
```

Look for the line with your email and copy the 6-digit code.

### Option 2: Check Email (If Configured)

If email is properly configured, check your inbox for:
- **Subject:** "Your OTP Code"
- **From:** Survey Application
- **Content:** 6-digit OTP code

---

## 🔍 Troubleshooting Login

### Issue: "No account found with this email"

**Solution:**
1. Make sure you ran the seed script:
   ```bash
   node server/seed.js
   ```
2. Check the email spelling (case-insensitive)
3. Use one of the emails listed above

### Issue: "Invalid or expired OTP"

**Solution:**
1. Check server console for the correct OTP
2. OTP expires after 10 minutes
3. Request a new OTP if expired
4. Make sure you're entering the 6-digit code correctly

### Issue: OTP not showing in console

**Solution:**
1. Check if server is running: `npm run server`
2. Look for email configuration in `.env`
3. Check server logs for errors

### Issue: Login successful but redirects to wrong page

**Solution:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + Shift + R)
3. Try incognito mode
4. Check browser console for errors

---

## 🎯 Quick Test Flow

### Test as Admin:

1. **Login:** http://localhost:3000/login
   - Email: `hkapoor@1gen.io`
   - Get OTP from server console
   - Enter OTP

2. **Dashboard:** Should redirect to `/admin`
   - See organizations, templates, support

3. **View Reports:**
   - Click "Organizations" in sidebar
   - Click on "Sample Organization"
   - Click green "View Reports" button
   - Explore the AI & Humanity Matrix

### Test as CEO:

1. **Login:** http://localhost:3000/login
   - Email: `ceo@mailto.plus`
   - Get OTP from server console
   - Enter OTP

2. **Dashboard:** Should redirect to `/ceo`
   - See employees, departments, surveys

3. **Manage Organization:**
   - Add employees
   - Create departments
   - Assign surveys

### Test as User:

1. **Login:** http://localhost:3000/login
   - Email: `user@mailto.plus`
   - Get OTP from server console
   - Enter OTP

2. **Dashboard:** Should redirect to `/dashboard`
   - See assigned surveys
   - Take surveys
   - Submit responses

---

## 📊 Sample Data Created

The seed script also created:

- ✅ **Sample Organization:** "Sample Organization"
- ✅ **Sample Department:** "Engineering"
- ✅ **Admin User:** Harsh Kapoor
- ✅ **CEO User:** John CEO
- ✅ **Regular User:** Jane User

---

## 🔐 Security Notes

### Development vs Production:

**Development (Current):**
- OTP printed to console
- Easy testing
- No actual emails sent

**Production:**
- OTP sent to real email
- Email service must be configured
- Check `.env` for EMAIL_USER and EMAIL_PASS

### Password Security:

- All passwords are hashed with bcrypt
- Never stored in plain text
- Secure JWT tokens for sessions

---

## 💡 Pro Tips

1. **Keep server console visible** to see OTPs
2. **Use admin account** to test reports system
3. **Create more users** via CEO dashboard
4. **Assign surveys** to test scoring
5. **Check browser console** (F12) for errors

---

## 🎉 Ready to Login!

**Server Status:**
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Database seeded with test accounts

**Next Steps:**
1. Visit http://localhost:3000/login
2. Use one of the emails above
3. Get OTP from server console
4. Login and explore!

---

## 📚 Related Documentation

- **APPLICATION_RUNNING.md** - System status
- **SCORING_LOGIC_EXPLAINED.md** - How scoring works
- **LOGIN_AND_ACCESS_GUIDE.md** - User roles & permissions
- **QUICK_START.md** - Startup guide
