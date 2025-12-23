# 📋 New Survey Structure - Visual Guide

## 🎯 How Surveys Will Look

### For Admin (Template Builder):

```
┌─────────────────────────────────────────────────────────────────┐
│  CREATE SURVEY TEMPLATE                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Question Number: [6.01]                                         │
│  Question Text: [How does your organization approach AI?]       │
│                                                                  │
│  ┌─ PRESENT ASPECT ─────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Option Text              Creativity (C)  Morality (M)    │  │
│  │  ─────────────────────────────────────────────────────    │  │
│  │  Not at all                    1              1           │  │
│  │  To a small extent             2              2           │  │
│  │  To a moderate extent          3              3           │  │
│  │  To a great extent             4              4           │  │
│  │  Completely                    5              5           │  │
│  │  Unable to Assess              0              0           │  │
│  │                                                            │  │
│  │  [+ Add Option]                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ FUTURE ASPECT ──────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Option Text              Creativity (C)  Morality (M)    │  │
│  │  ─────────────────────────────────────────────────────    │  │
│  │  Not at all                    1              1           │  │
│  │  To a small extent             2              2           │  │
│  │  To a moderate extent          3              3           │  │
│  │  To a great extent             4              4           │  │
│  │  Completely                    5              5           │  │
│  │  Unable to Assess              0              0           │  │
│  │                                                            │  │
│  │  [+ Add Option]                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Add Question]  [Save Template]                                │
└─────────────────────────────────────────────────────────────────┘
```

### For Users (Taking Survey):

```
┌─────────────────────────────────────────────────────────────────┐
│  SURVEY: AI Readiness Assessment                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Question 6.01: How does your organization approach AI?          │
│                                                                  │
│  ┌─ PRESENT ASPECT ─────────────────────────────────────────┐  │
│  │  Select one option that best describes current state:     │  │
│  │                                                            │  │
│  │  ○ Not at all                                              │  │
│  │  ○ To a small extent                                       │  │
│  │  ● To a moderate extent                    [SELECTED]      │  │
│  │  ○ To a great extent                                       │  │
│  │  ○ Completely                                              │  │
│  │  ○ Unable to Assess                                        │  │
│  │                                                            │  │
│  │  (Marks are hidden from user)                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ FUTURE ASPECT ──────────────────────────────────────────┐  │
│  │  Select one option that best describes future vision:     │  │
│  │                                                            │  │
│  │  ○ Not at all                                              │  │
│  │  ○ To a small extent                                       │  │
│  │  ○ To a moderate extent                                    │  │
│  │  ● To a great extent                       [SELECTED]      │  │
│  │  ○ Completely                                              │  │
│  │  ○ Unable to Assess                                        │  │
│  │                                                            │  │
│  │  (Marks are hidden from user)                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Previous]  [Next Question]  [Submit]                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Structure

### Survey Model:

```javascript
{
  title: "AI Readiness Assessment",
  description: "Evaluate your organization's AI maturity",
  questions: [
    {
      questionNumber: "6.01",
      question: "How does your organization approach AI?",
      
      // Present Aspect - ONE array with BOTH marks
      presentOptions: [
        {
          text: "Not at all",
          creativityMarks: 1,
          moralityMarks: 1
        },
        {
          text: "To a small extent",
          creativityMarks: 2,
          moralityMarks: 2
        },
        {
          text: "To a moderate extent",
          creativityMarks: 3,
          moralityMarks: 3
        },
        {
          text: "To a great extent",
          creativityMarks: 4,
          moralityMarks: 4
        },
        {
          text: "Completely",
          creativityMarks: 5,
          moralityMarks: 5
        },
        {
          text: "Unable to Assess",
          creativityMarks: 0,
          moralityMarks: 0
        }
      ],
      
      // Future Aspect - ONE array with BOTH marks
      futureOptions: [
        {
          text: "Not at all",
          creativityMarks: 1,
          moralityMarks: 1
        },
        {
          text: "To a small extent",
          creativityMarks: 2,
          moralityMarks: 2
        },
        {
          text: "To a moderate extent",
          creativityMarks: 3,
          moralityMarks: 3
        },
        {
          text: "To a great extent",
          creativityMarks: 4,
          moralityMarks: 4
        },
        {
          text: "Completely",
          creativityMarks: 5,
          moralityMarks: 5
        },
        {
          text: "Unable to Assess",
          creativityMarks: 0,
          moralityMarks: 0
        }
      ],
      
      required: true
    }
  ]
}
```

### Survey Response Model:

```javascript
{
  surveyId: "...",
  employeeId: "...",
  answers: [
    {
      questionId: "...",
      questionNumber: "6.01",
      
      // Present Aspect - User selected option index 2
      presentOptionIndex: 2,  // "To a moderate extent"
      presentCreativityMarks: 3,  // Stored from option
      presentMoralityMarks: 3,    // Stored from option
      
      // Future Aspect - User selected option index 3
      futureOptionIndex: 3,  // "To a great extent"
      futureCreativityMarks: 4,  // Stored from option
      futureMoralityMarks: 4     // Stored from option
    }
  ],
  
  // Calculated totals (sum of all questions)
  presentCreativityTotal: 42,
  presentMoralityTotal: 39,
  futureCreativityTotal: 48,
  futureMoralityTotal: 45,
  
  // Calculated percentages
  presentCreativityPercentage: 70.0,
  presentMoralityPercentage: 65.0,
  futureCreativityPercentage: 80.0,
  futureMoralityPercentage: 75.0,
  
  // Bands
  presentCreativityBand: "Leading",
  presentMoralityBand: "Leading",
  futureCreativityBand: "Leading",
  futureMoralityBand: "Leading"
}
```

---

## 🧮 Scoring Calculation

### Example: 20 Questions Survey

**User's Selections:**

| Question | Present Option | Present C | Present M | Future Option | Future C | Future M |
|----------|---------------|-----------|-----------|---------------|----------|----------|
| Q1 | "To a great extent" | 4 | 4 | "Completely" | 5 | 5 |
| Q2 | "To a moderate extent" | 3 | 3 | "To a great extent" | 4 | 4 |
| Q3 | "To a moderate extent" | 3 | 3 | "To a moderate extent" | 3 | 3 |
| ... | ... | ... | ... | ... | ... | ... |
| Q20 | "To a great extent" | 4 | 4 | "Completely" | 5 | 5 |

**Totals:**
```
Present Creativity Total: 42 marks (sum of all Present C marks)
Present Morality Total: 39 marks (sum of all Present M marks)
Future Creativity Total: 48 marks (sum of all Future C marks)
Future Morality Total: 45 marks (sum of all Future M marks)
```

**Percentages:**
```
Max Score = 20 questions × 5 marks = 100

Present Creativity: (42 / 100) × 100 = 42.0%
Present Morality: (39 / 100) × 100 = 39.0%
Future Creativity: (48 / 100) × 100 = 48.0%
Future Morality: (45 / 100) × 100 = 45.0%
```

**Bands:**
```
Present Creativity: 42.0% → Emerging (40-49%)
Present Morality: 39.0% → Early (0-39%)
Future Creativity: 48.0% → Emerging (40-49%)
Future Morality: 45.0% → Emerging (40-49%)
```

**Quadrants:**
```
Present: C=42% (<50%) + M=39% (<50%) → Extraction Engine (Red)
Future: C=48% (<50%) + M=45% (<50%) → Extraction Engine (Red)
```

---

## 📈 Reports Display

### Admin Views Report:

```
┌─────────────────────────────────────────────────────────────────┐
│  ORGANIZATION REPORT - Tech Corp Inc.                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Survey: AI Readiness Assessment                                 │
│  Responses: 50 employees                                         │
│                                                                  │
│  [Present Scenario] [Future Scenario] ← Toggle                  │
│                                                                  │
│  ┌─ AGGREGATE SCORES (Present) ──────────────────────────────┐  │
│  │                                                             │  │
│  │  Avg Creativity: 58.5% (Leading)                            │  │
│  │  Avg Morality: 62.3% (Leading)                              │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ AI & HUMANITY MATRIX ──────────────────────────────────────┐  │
│  │                                                             │  │
│  │         High Creativity                                     │  │
│  │              ↑                                              │  │
│  │              │                                              │  │
│  │   🟠 Safe    │    🟢 Hope                                   │  │
│  │   Stagnation │    in Action                                │  │
│  │   (8 emp)    │    (28 emp)                                 │  │
│  │   ───────────┼───────────                                  │  │
│  │   🔴 Extract │    🔵 Unbounded                              │  │
│  │   Engine     │    Power                                    │  │
│  │   (2 emp)    │    (12 emp)                                 │  │
│  │              │                                              │  │
│  │              └──────────────→ High Morality                │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ INDIVIDUAL SCORES ─────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  Employee      | Dept    | C%   | M%   | Quadrant          │  │
│  │  ─────────────────────────────────────────────────────────  │  │
│  │  John Doe      | Eng     | 70%  | 65%  | Hope in Action    │  │
│  │  Jane Smith    | Sales   | 45%  | 55%  | Safe Stagnation   │  │
│  │  Bob Johnson   | Eng     | 80%  | 40%  | Unbounded Power   │  │
│  │  ...           | ...     | ...  | ...  | ...               │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Download Report]                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Benefits of New Structure

### 1. Simpler for Users
- ✅ Select ONE option for Present
- ✅ Select ONE option for Future
- ✅ No confusion about multiple selections

### 2. Clearer UI
- ✅ Present block clearly separated
- ✅ Future block clearly separated
- ✅ Matches your screenshot exactly

### 3. Easier Scoring
- ✅ One selection = both C & M marks
- ✅ Clear calculation path
- ✅ No complex cross-referencing

### 4. Better Admin Experience
- ✅ Set both marks in one place
- ✅ See complete option with both dimensions
- ✅ Easier to balance scoring

---

## 🔄 Comparison: Old vs New

### OLD Structure (4 Arrays):

```javascript
// Admin had to manage 4 separate arrays
presentCreativityOptions: [
  {text: "Not at all", marks: 1},
  {text: "To a small extent", marks: 2}
],
presentMoralityOptions: [
  {text: "Not at all", marks: 1},
  {text: "To a small extent", marks: 2}
],
futureCreativityOptions: [...],
futureMoralityOptions: [...]

// User had to select from 4 different dropdowns
// Confusing and error-prone
```

### NEW Structure (2 Arrays):

```javascript
// Admin manages 2 arrays with combined marks
presentOptions: [
  {text: "Not at all", creativityMarks: 1, moralityMarks: 1},
  {text: "To a small extent", creativityMarks: 2, moralityMarks: 2}
],
futureOptions: [
  {text: "Not at all", creativityMarks: 1, moralityMarks: 1},
  {text: "To a small extent", creativityMarks: 2, moralityMarks: 2}
]

// User selects from 2 dropdowns (Present, Future)
// Clear and intuitive
```

---

## 🎯 Summary

**The new structure means:**

1. **For Admin:** Create options with BOTH creativity and morality marks in the same place
2. **For Users:** Select ONE option for Present, ONE option for Future
3. **For System:** Calculate BOTH C & M scores from each selection
4. **For Reports:** Display scores for both dimensions from combined data

**This matches exactly what you showed in your screenshot!**
