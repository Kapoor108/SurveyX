# 🔄 Schema Change Summary

## What Changed

I've updated the survey structure to combine Creativity and Morality marks in the same option block:

### Old Structure (4 separate option arrays):
```javascript
{
  presentCreativityOptions: [{text, marks}],
  presentMoralityOptions: [{text, marks}],
  futureCreativityOptions: [{text, marks}],
  futureMoralityOptions: [{text, marks}]
}
```

### New Structure (2 option arrays with combined marks):
```javascript
{
  presentOptions: [{text, creativityMarks, moralityMarks}],
  futureOptions: [{text, creativityMarks, moralityMarks}]
}
```

## Files Updated

1. ✅ `server/models/Survey.js` - New schema with combined marks
2. ✅ `server/models/SurveyResponse.js` - Updated to match new structure
3. ✅ `server/routes/reports.js` - Updated scoring calculation

## What This Means

**Present Aspect:**
- Each option now has BOTH creativity marks AND morality marks
- User selects ONE option per question for Present
- System calculates both C and M scores from that single selection

**Future Aspect:**
- Each option now has BOTH creativity marks AND morality marks  
- User selects ONE option per question for Future
- System calculates both C and M scores from that single selection

## Current Issue

The database still has surveys with the OLD structure, but the code expects the NEW structure. This causes errors when trying to view reports.

## Solution Options

### Option 1: Clear Database and Start Fresh (Recommended)

```bash
# Drop the database
mongo surveyapp --eval "db.dropDatabase()"

# Or in MongoDB Compass: Delete all collections

# Then reseed
node server/seed.js
```

### Option 2: Keep Old Structure (Revert Changes)

If you want to keep the old 4-array structure, I can revert the changes.

### Option 3: Migration Script

Create a script to migrate existing surveys to new structure.

## Recommendation

Since this is development and you're testing, **Option 1 (Clear & Reseed)** is fastest and cleanest.

The new structure is better because:
- ✅ Simpler for users (one selection per aspect)
- ✅ Clearer UI (Present block, Future block)
- ✅ Easier to understand
- ✅ Matches your screenshot exactly

## Next Steps

1. Clear the database
2. Restart server
3. Reseed with test data
4. Create new templates with new structure
5. Test reports

Would you like me to proceed with clearing the database and reseeding?
