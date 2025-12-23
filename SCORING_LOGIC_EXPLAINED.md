# 📊 Scoring Logic & Organization Stage Determination

## 🎯 Overview

The system evaluates organizations based on employee survey responses, calculating scores across two dimensions (Creativity and Morality) in two timeframes (Present and Future scenarios).

---

## 📝 Survey Structure

### Each Question Has 4 Option Sets:

1. **Present Aspect - Creativity (C)** - How creative is the current approach?
2. **Present Aspect - Morality (M)** - How ethical is the current approach?
3. **Future Aspect - Creativity (C)** - How creative is the future vision?
4. **Future Aspect - Morality (M)** - How ethical is the future vision?

### Each Option Has Hidden Marks:

```javascript
{
  text: "Option text shown to user",
  marks: 0-3  // Hidden score (0=lowest, 3=highest)
}
```

**Example Question:**

```
Question: "How does your organization approach AI implementation?"

Present Creativity Options:
- "We avoid AI completely" (marks: 0)
- "We use basic automation" (marks: 1)
- "We experiment with AI tools" (marks: 2)
- "We innovate with custom AI solutions" (marks: 3)

Present Morality Options:
- "No ethical guidelines" (marks: 0)
- "Basic compliance only" (marks: 1)
- "Clear ethical policies" (marks: 2)
- "Comprehensive ethical framework with accountability" (marks: 3)

Future Creativity Options:
- "No AI plans" (marks: 0)
- "Maintain current level" (marks: 1)
- "Expand AI usage" (marks: 2)
- "Lead AI innovation in industry" (marks: 3)

Future Morality Options:
- "Ethics not considered" (marks: 0)
- "Minimal ethical oversight" (marks: 1)
- "Strong ethical guidelines" (marks: 2)
- "Industry-leading ethical AI practices" (marks: 3)
```

---

## 🧮 Calculation Process

### Step 1: Collect Responses

When an employee submits a survey:
- They select one option from each of the 4 option sets per question
- The system stores the **option index** (0, 1, 2, or 3)
- Marks are retrieved from the database (never shown to user)

### Step 2: Calculate Totals

For a survey with **N questions**:

```javascript
// Present Aspect
presentCreativityTotal = sum of all Present Creativity option marks
presentMoralityTotal = sum of all Present Morality option marks

// Future Aspect
futureCreativityTotal = sum of all Future Creativity option marks
futureMoralityTotal = sum of all Future Morality option marks
```

**Example with 20 questions:**
- Employee selects options with marks: [2, 3, 1, 2, 3, 2, 2, 1, 3, 2, 2, 3, 1, 2, 3, 2, 2, 1, 3, 2]
- Present Creativity Total = 2+3+1+2+3+2+2+1+3+2+2+3+1+2+3+2+2+1+3+2 = **42**

### Step 3: Calculate Percentages

```javascript
maxScore = numberOfQuestions × 3  // Maximum possible score

// For 20 questions: maxScore = 20 × 3 = 60

presentCreativityPercentage = (presentCreativityTotal / maxScore) × 100
presentMoralityPercentage = (presentMoralityTotal / maxScore) × 100
futureCreativityPercentage = (futureCreativityTotal / maxScore) × 100
futureMoralityPercentage = (futureMoralityTotal / maxScore) × 100
```

**Example:**
- Present Creativity Total = 42
- Max Score = 60
- Present Creativity Percentage = (42 / 60) × 100 = **70.0%**

### Step 4: Classify into Bands

Based on percentage, assign a band:

| Percentage Range | Band | Meaning |
|-----------------|------|---------|
| 0% - 39% | **Early** | Beginning stage, significant room for improvement |
| 40% - 49% | **Emerging** | Developing capabilities, on the right track |
| 50% - 100% | **Leading** | Advanced stage, strong performance |

**Example:**
- 70.0% → **Leading** band

### Step 5: Determine Quadrant

Based on Creativity and Morality percentages, place in one of 4 quadrants:

```
                    High Creativity (≥50%)
                            ↑
                            |
    Low Morality            |            High Morality
        (<50%)              |                (≥50%)
                            |
    ────────────────────────┼────────────────────────
                            |
    Extraction Engine       |       Hope in Action
    (Red Quadrant)          |       (Green Quadrant)
    - Low Creativity        |       - High Creativity
    - Low Morality          |       - High Morality
                            |       ✅ TARGET ZONE
    ────────────────────────┼────────────────────────
                            |
    Safe Stagnation         |       Unbounded Power
    (Orange Quadrant)       |       (Blue Quadrant)
    - Low Creativity        |       - High Creativity
    - High Morality         |       - Low Morality
                            |
                            ↓
```

**Quadrant Logic:**

```javascript
if (creativityPercentage >= 50 && moralityPercentage >= 50) {
  quadrant = "Hope in Action (IGEN Zone)";  // ✅ BEST
  color = "Green";
}
else if (creativityPercentage >= 50 && moralityPercentage < 50) {
  quadrant = "Unbounded Power";  // ⚠️ High innovation, low ethics
  color = "Blue";
}
else if (creativityPercentage < 50 && moralityPercentage >= 50) {
  quadrant = "Safe Stagnation";  // ⚠️ Ethical but not innovative
  color = "Orange";
}
else {
  quadrant = "Extraction Engine";  // ❌ WORST - Low on both
  color = "Red";
}
```

**Example:**
- Creativity = 70% (≥50%)
- Morality = 65% (≥50%)
- **Quadrant: Hope in Action (IGEN Zone)** ✅

---

## 🏢 Organization Stage Determination

### Individual Employee Score:

Each employee gets:
```json
{
  "present": {
    "creativity_total": 42,
    "morality_total": 39,
    "creativity_percentage": 70.0,
    "morality_percentage": 65.0,
    "creativity_band": "Leading",
    "morality_band": "Leading",
    "quadrant": "Hope in Action (IGEN Zone)"
  },
  "future": {
    "creativity_total": 48,
    "morality_total": 45,
    "creativity_percentage": 80.0,
    "morality_percentage": 75.0,
    "creativity_band": "Leading",
    "morality_band": "Leading",
    "quadrant": "Hope in Action (IGEN Zone)"
  }
}
```

### Organization Aggregate Score:

The system calculates **averages across all employees**:

```javascript
// For an organization with 50 employees who completed the survey:

avgPresentCreativityPercentage = 
  (employee1.present.creativity_percentage + 
   employee2.present.creativity_percentage + 
   ... + 
   employee50.present.creativity_percentage) / 50

avgPresentMoralityPercentage = 
  (sum of all present morality percentages) / 50

// Same for Future aspect
```

**Example Organization Report:**

```json
{
  "organization": "Tech Corp Inc.",
  "totalResponses": 50,
  "aggregateScores": {
    "present": {
      "avgCreativityPercentage": 58.5,  // Average across 50 employees
      "avgMoralityPercentage": 62.3,
      "avgCreativityTotal": 35.1,
      "avgMoralityTotal": 37.4,
      "quadrantDistribution": {
        "Hope in Action (IGEN Zone)": 28,  // 28 employees in this quadrant
        "Unbounded Power": 12,
        "Safe Stagnation": 8,
        "Extraction Engine": 2
      }
    },
    "future": {
      "avgCreativityPercentage": 65.2,
      "avgMoralityPercentage": 68.7,
      "avgCreativityTotal": 39.1,
      "avgMoralityTotal": 41.2,
      "quadrantDistribution": {
        "Hope in Action (IGEN Zone)": 35,
        "Unbounded Power": 10,
        "Safe Stagnation": 4,
        "Extraction Engine": 1
      }
    }
  }
}
```

### Organization Stage Classification:

Based on **aggregate scores**, the organization is classified:

| Metric | Value | Stage |
|--------|-------|-------|
| Avg Creativity | 58.5% | **Leading** (≥50%) |
| Avg Morality | 62.3% | **Leading** (≥50%) |
| **Overall Quadrant** | **Hope in Action** | ✅ **Target Zone** |

**Interpretation:**
- **Present State:** Organization is in the "Hope in Action" zone with 56% of employees (28/50) already there
- **Future Vision:** Improving to 70% of employees (35/50) in the target zone
- **Trajectory:** Positive - moving toward top-right quadrant

---

## 📈 What Each Quadrant Means

### 🟢 Hope in Action (IGEN Zone) - TARGET
**Characteristics:**
- High innovation AND high ethics
- Trusted AI implementation
- Responsible scaling
- Accountability frameworks in place

**Organization Stage:** **LEADING** - Best practice organization

**Actions to Maintain:**
- Continue innovation with ethical oversight
- Share best practices
- Lead industry standards

---

### 🔵 Unbounded Power
**Characteristics:**
- High innovation BUT low ethics
- Autonomous agents without oversight
- Unsafe automation
- Lack of accountability

**Organization Stage:** **EMERGING** (Innovation) + **EARLY** (Ethics)

**Actions Needed:**
- Implement ethical guidelines
- Add accountability measures
- Create "do-not-automate" list
- Establish trust contracts

---

### 🟠 Safe Stagnation
**Characteristics:**
- High ethics BUT low innovation
- Committee caution
- Missed opportunities
- Risk-averse culture

**Organization Stage:** **EARLY** (Innovation) + **EMERGING** (Ethics)

**Actions Needed:**
- Encourage experimentation
- Pilot innovative projects
- Balance risk with opportunity
- Invest in R&D

---

### 🔴 Extraction Engine - AVOID
**Characteristics:**
- Low innovation AND low ethics
- Surveillance-first approach
- Exploitative practices
- No ethical framework

**Organization Stage:** **EARLY** on both dimensions

**Actions Needed (URGENT):**
- Establish ethical foundation
- Invest in innovation
- Change organizational culture
- Implement governance

---

## 🎯 Moving to Top Right (Hope in Action)

### From Extraction Engine (Red):
1. **Set Moral Boundaries** - Create ethics framework
2. **Invest in Innovation** - Build creative capabilities
3. **Cultural Change** - Transform mindset

### From Safe Stagnation (Orange):
1. **Encourage Innovation** - Reduce risk aversion
2. **Pilot Projects** - Test new approaches
3. **Maintain Ethics** - Keep strong moral foundation

### From Unbounded Power (Blue):
1. **Add Ethical Oversight** - Implement accountability
2. **Trust Contracts** - Define boundaries
3. **Maintain Innovation** - Keep creative edge

---

## 🔍 Example Calculation Walkthrough

### Scenario: 20-question survey, 1 employee

**Employee Responses:**

| Question | Present C | Present M | Future C | Future M |
|----------|-----------|-----------|----------|----------|
| Q1 | 2 marks | 3 marks | 3 marks | 3 marks |
| Q2 | 1 marks | 2 marks | 2 marks | 3 marks |
| Q3 | 3 marks | 2 marks | 3 marks | 2 marks |
| ... | ... | ... | ... | ... |
| Q20 | 2 marks | 3 marks | 3 marks | 3 marks |

**Totals:**
- Present Creativity Total: 42 marks
- Present Morality Total: 39 marks
- Future Creativity Total: 48 marks
- Future Morality Total: 45 marks

**Percentages:**
- Max Score = 20 × 3 = 60
- Present Creativity: (42/60) × 100 = **70.0%**
- Present Morality: (39/60) × 100 = **65.0%**
- Future Creativity: (48/60) × 100 = **80.0%**
- Future Morality: (45/60) × 100 = **75.0%**

**Bands:**
- All percentages ≥50% → All **Leading**

**Quadrants:**
- Present: 70% C + 65% M → **Hope in Action** ✅
- Future: 80% C + 75% M → **Hope in Action** ✅

**Interpretation:**
This employee demonstrates strong performance in both creativity and morality, currently in the target zone and improving further in the future vision.

---

## 🔐 Security & Privacy

### Who Can See What:

| Role | Can See |
|------|---------|
| **User/Employee** | - Their own survey questions<br>- NO marks visible<br>- NO scores visible |
| **CEO** | - Aggregate organization scores<br>- Quadrant distribution<br>- NO individual employee marks |
| **Admin** | - Everything<br>- Individual employee scores<br>- All marks and calculations<br>- Full reports |

### Why Marks Are Hidden:

1. **Prevents gaming** - Users can't optimize for scores
2. **Authentic responses** - Encourages honest answers
3. **Reduces bias** - No preconceived notions about "right" answers
4. **Privacy** - Individual scores protected from peers

---

## 📊 Report Output Format

### JSON Download Structure:

```json
{
  "organization": "Tech Corp Inc.",
  "survey": "AI Readiness Assessment Q4 2024",
  "aspect": "Present Scenario",
  "generatedAt": "2024-12-23T10:30:00Z",
  "aggregateScores": {
    "avgCreativityPercentage": 58.5,
    "avgMoralityPercentage": 62.3,
    "avgCreativityTotal": 35.1,
    "avgMoralityTotal": 37.4,
    "quadrantDistribution": {
      "Hope in Action (IGEN Zone)": 28,
      "Unbounded Power": 12,
      "Safe Stagnation": 8,
      "Extraction Engine": 2
    }
  },
  "responses": [
    {
      "employee": "John Doe",
      "department": "Engineering",
      "creativity_percentage": 70.0,
      "morality_percentage": 65.0,
      "creativity_band": "Leading",
      "morality_band": "Leading",
      "quadrant": "Hope in Action (IGEN Zone)"
    }
    // ... more employees
  ]
}
```

---

## ✅ Summary

**The system determines organization stage by:**

1. ✅ Collecting employee survey responses
2. ✅ Calculating hidden marks for each answer
3. ✅ Computing totals and percentages
4. ✅ Classifying into bands (Early/Emerging/Leading)
5. ✅ Placing in quadrants based on Creativity × Morality
6. ✅ Aggregating across all employees
7. ✅ Visualizing in AI & Humanity Matrix
8. ✅ Providing actionable insights for improvement

**Goal:** Move organization to **Hope in Action (IGEN Zone)** - the top-right quadrant where high creativity meets high morality.
