# Tutorial System Documentation

## Overview

A comprehensive, W3Schools-style tutorial system has been integrated into your SimuLab platform. Each experiment now has detailed, chapter-based tutorials with theory, formulas, examples, and visual descriptions.

## ✨ Features

### 📚 W3Schools-Style Tutorials
- **Chapter-based structure** - Break down complex concepts into manageable chapters
- **Multiple learning approaches** - Theory, formulas, examples, and visual descriptions
- **Interactive navigation** - Easy chapter navigation with previous/next buttons
- **Beautiful UI** - Color-coded by difficulty (beginner, intermediate, advanced)

### 📊 Six Complete Tutorials
1. **Free Fall** (Physics, Beginner) - 5 chapters, 15 minutes
2. **Projectile Motion** (Physics, Intermediate) - 6 chapters, 20 minutes
3. **Simple Pendulum** (Physics, Beginner) - 6 chapters, 18 minutes
4. **Elastic Collision** (Physics, Intermediate) - 6 chapters, 22 minutes
5. **Acid-Base Neutralization** (Chemistry, Beginner) - 6 chapters, 16 minutes
6. **Acid-Base Titration** (Chemistry, Intermediate) - 7 chapters, 25 minutes

### 🎯 Each Tutorial Includes
- **Learning Objectives** - Clear goals for what students will learn
- **Prerequisites** - Background knowledge needed
- **Multiple Chapters** - Structured progression of concepts
- **Key Points** - Highlighted main takeaways
- **Formulas** - Highlighted equations with proper formatting
- **Examples** - Real-world calculations with step-by-step solutions
- **Visual Descriptions** - Guidance for understanding diagrams
- **Related Topics** - Links to related concepts
- **References** - Links to external learning resources

## 🗄️ Database Structure

### Tutorial Collection Schema
```typescript
{
  _id: ObjectId
  experimentId: string (unique, indexed) // e.g., "freefall"
  experimentName: string
  category: "physics" | "chemistry"
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number // in minutes
  objectives: string[]
  prerequisites: string[]
  chapters: [
    {
      chapterNumber: number
      title: string
      content: string
      keyPoints: string[]
      visualDescription?: string
      formula?: string
      examples?: [
        {
          title: string
          description: string
          calculation?: string
        }
      ]
    }
  ]
  relatedTopics: string[]
  references: [
    {
      title: string
      url: string
    }
  ]
  createdAt: Date
  updatedAt: Date
}
```

## 🚀 How to Use

### Access Tutorials
1. Go to **http://localhost:3000/dashboard**
2. Under "Start a New Experiment" section, each experiment card now has:
   - **"Start Experiment"** button (blue) - Opens the simulation
   - **"Learn More"** button (outline) - Opens the tutorial

### Tutorial Pages
- **URL Format**: `http://localhost:3000/tutorials/{experimentId}`
- Examples:
  - `http://localhost:3000/tutorials/freefall`
  - `http://localhost:3000/tutorials/pendulum`
  - `http://localhost:3000/tutorials/projectilemotion`
  - `http://localhost:3000/tutorials/collision`
  - `http://localhost:3000/tutorials/acidbase`
  - `http://localhost:3000/tutorials/titration`

### Tutorial Navigation
- **Left Sidebar**: 
  - Learning Objectives
  - Prerequisites
  - Duration and Chapter count
  - Chapter list (click to jump to chapter)
- **Main Content**:
  - Chapter content
  - Key points in blue boxes
  - Formulas in purple boxes
  - Examples in orange/yellow boxes
  - Visual descriptions in green boxes
- **Navigation**: Previous/Next chapter buttons at bottom

## 📡 API Endpoints

### Get All Tutorials
```bash
GET /api/tutorials
```

Query parameters:
- `?category=physics` - Filter by category
- `?difficulty=beginner` - Filter by difficulty level

Response:
```json
{
  "success": true,
  "data": [
    {
      "experimentId": "freefall",
      "experimentName": "Free Fall",
      ...
    }
  ]
}
```

### Get Specific Tutorial
```bash
GET /api/tutorials/{experimentId}
```

Example:
```bash
GET /api/tutorials/freefall
```

Response:
```json
{
  "success": true,
  "data": {
    "experimentId": "freefall",
    "experimentName": "Free Fall",
    "chapters": [...]
  }
}
```

### Update Tutorial
```bash
PUT /api/tutorials/{experimentId}
```

Body:
```json
{
  "objectives": ["New objective"],
  "chapters": [...],
  "description": "Updated description"
}
```

## 🔧 Managing Tutorials

### Seed Tutorials to Database
```bash
npm run seed:tutorials
```

This seeds all 6 pre-built tutorials to MongoDB.

### Update Tutorial in Database
The tutorial system is fully editable through the API. You can update any tutorial:

```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "objectives": ["New objective"],
    "chapters": [...]
  }'
```

### Add New Tutorial
1. Create tutorial object following the schema
2. Use the API to insert it:
```bash
POST /api/tutorials (create endpoint can be added)
```

Or directly in MongoDB:
```javascript
db.tutorials.insertOne({
  experimentId: "newtutorial",
  experimentName: "New Tutorial",
  category: "physics",
  // ... other fields
})
```

## 📝 Tutorial Content Structure

### Chapter Example
```javascript
{
  chapterNumber: 1,
  title: "What is Free Fall?",
  content: "Long-form explanation of the concept...",
  keyPoints: [
    "Point 1",
    "Point 2",
    "Point 3"
  ],
  visualDescription: "Description of what a visual diagram should show",
  formula: "v = gt",
  examples: [
    {
      title: "Example 1",
      description: "Problem statement",
      calculation: "Step-by-step solution"
    }
  ]
}
```

## 🎨 UI Components

The tutorial page uses:
- **Color-coded difficulty badges**:
  - Green (Beginner)
  - Yellow (Intermediate)
  - Red (Advanced)
- **Color-coded category badges**:
  - Blue (Physics)
  - Purple (Chemistry)
- **Color-coded content sections**:
  - Blue: Key Points
  - Purple: Formulas
  - Orange: Examples
  - Green: Visual Descriptions

## 📚 Tutorial Content Highlights

### Physics Tutorials

**Free Fall** - Learn how objects accelerate under gravity:
- Equations of motion
- Velocity-time relationships
- Position-time graphs

**Projectile Motion** - Study 2D motion under gravity:
- Velocity components
- Time of flight
- Range and maximum height
- Trajectory equation

**Simple Pendulum** - Explore periodic motion:
- Period and frequency
- Effect of length on period
- Energy conservation
- Simple harmonic motion

**Elastic Collision** - Understand conservation laws:
- Momentum conservation
- Energy conservation
- Collision formulas
- Coefficient of restitution

### Chemistry Tutorials

**Acid-Base Neutralization** - Learn about neutralization:
- Acids and bases definition
- pH scale
- Strong acids and bases
- Neutralization reactions
- Stoichiometry

**Acid-Base Titration** - Master analytical techniques:
- Titration procedure
- Equipment and setup
- Indicator selection
- Equivalence point vs endpoint
- Calculations
- Sources of error

## 🔄 Future Enhancements

### Easy to Implement
1. **Search functionality** - Find tutorials by keyword
2. **Related tutorials** - Show similar tutorials
3. **Progress tracking** - Track which chapters students have completed
4. **Notes/annotations** - Allow students to add notes to tutorials
5. **Difficulty progression** - Suggest tutorials based on completed ones
6. **Video integration** - Embed videos with explanations
7. **Interactive quizzes** - Add chapter quizzes to test understanding
8. **Print/export** - Export tutorials as PDFs

### Database Updates
The tutorial system is designed to be easily updated:
1. Connect to MongoDB
2. Update any tutorial using the `/api/tutorials/{experimentId}` PUT endpoint
3. Changes appear immediately in the tutorial pages

## 📋 File Structure

```
src/
├── models/
│   └── Tutorial.ts              ← Tutorial schema
├── app/
│   ├── dashboard/page.tsx       ← Updated with "Learn More" buttons
│   ├── api/tutorials/
│   │   ├── route.ts             ← GET all tutorials
│   │   └── [experimentId]/route.ts ← GET/PUT specific tutorial
│   └── tutorials/
│       └── [experimentId]/page.tsx ← Tutorial display page
└── scripts/
    └── seedTutorials.ts         ← Seed script
```

## ✅ Status

- ✓ 6 complete tutorials created
- ✓ Tutorial pages with W3Schools-style layout
- ✓ "Learn More" buttons added to dashboard
- ✓ MongoDB collection "tutorials" seeded
- ✓ API endpoints for CRUD operations
- ✓ Beautiful, responsive UI
- ✓ Easy to update and maintain

## 🎓 Example: Extending Tutorials

To add more content to a tutorial in the future:

```javascript
// Update via API
await fetch('/api/tutorials/freefall', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapters: [
      ...existingChapters,
      {
        chapterNumber: 6,
        title: "Advanced Topics",
        content: "New content here",
        keyPoints: ["New point"]
      }
    ]
  })
})
```

All changes are immediately reflected when users access the tutorial!
