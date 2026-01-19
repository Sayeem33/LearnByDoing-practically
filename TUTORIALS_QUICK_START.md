# 🎓 Tutorial System - Quick Start Guide

## ✅ What Was Added

A complete, professional tutorial system with 6 in-depth tutorials for all experiments, stored in MongoDB and easily updatable.

---

## 🚀 Try It Now

### 1. View Dashboard with New Buttons
Navigate to: **http://localhost:3000/dashboard**

You'll see each experiment now has TWO buttons:
- 🔵 **Start Experiment** - Opens the lab
- ⬜ **Learn More** - Opens the tutorial

### 2. Open a Tutorial
Click "Learn More" on any experiment OR go directly to:
- `http://localhost:3000/tutorials/freefall`
- `http://localhost:3000/tutorials/projectilemotion`
- `http://localhost:3000/tutorials/pendulum`
- `http://localhost:3000/tutorials/collision`
- `http://localhost:3000/tutorials/acidbase`
- `http://localhost:3000/tutorials/titration`

### 3. Explore Tutorial Features
- ✓ **Sidebar Navigation** - Jump between chapters
- ✓ **Learning Objectives** - See what you'll learn
- ✓ **Key Points** - Highlighted important concepts
- ✓ **Formulas** - Mathematical equations
- ✓ **Examples** - Real-world problems with solutions
- ✓ **Visual Descriptions** - Guidance on diagrams

---

## 📊 6 Complete Tutorials

| Tutorial | Category | Level | Chapters | Duration |
|----------|----------|-------|----------|----------|
| Free Fall | Physics | Beginner | 5 | 15 min |
| Projectile Motion | Physics | Intermediate | 6 | 20 min |
| Simple Pendulum | Physics | Beginner | 6 | 18 min |
| Elastic Collision | Physics | Intermediate | 6 | 22 min |
| Acid-Base Neutralization | Chemistry | Beginner | 6 | 16 min |
| Acid-Base Titration | Chemistry | Intermediate | 7 | 25 min |

---

## 📁 Database Collection

**Database**: `lab`  
**Collection**: `tutorials`  
**Documents**: 6 (one per experiment)

### Example Document
```json
{
  "_id": "ObjectId",
  "experimentId": "freefall",
  "experimentName": "Free Fall",
  "category": "physics",
  "difficulty": "beginner",
  "duration": 15,
  "objectives": ["Understand gravity", "Learn equations of motion"],
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "What is Free Fall?",
      "content": "...",
      "keyPoints": ["Point 1", "Point 2"],
      "formula": "v = gt",
      "examples": [...]
    }
  ]
}
```

---

## 🔧 Management Commands

### Reseed Tutorials
```bash
npm run seed:tutorials
```

### View API
Get all tutorials:
```bash
curl http://localhost:3000/api/tutorials
```

Get specific tutorial:
```bash
curl http://localhost:3000/api/tutorials/freefall
```

---

## 📝 Update Tutorial Content

### Via API (Recommended)
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "objectives": ["New objective"],
    "description": "Updated description"
  }'
```

### Via MongoDB Directly
Connect to your MongoDB Atlas cluster and update the tutorials collection.

---

## 🎨 Tutorial Page Features

### Left Sidebar
- 📌 Duration & Chapter count
- 🎯 Learning objectives
- 📚 Prerequisites
- 📑 Chapter navigation (click to jump)

### Main Content Area
- 📖 Chapter content
- 🔵 Key points (blue box)
- 🟣 Formulas (purple box)
- 🟠 Examples (orange box)
- 🟢 Visual descriptions (green box)

### Navigation
- ◀ Previous chapter button
- ▶ Next chapter button
- 📍 Current chapter indicator

---

## ✨ Tutorial Content Examples

### Free Fall - Chapter 2: Equations of Motion
```
Key Points:
• Velocity: v = gt
• Displacement: s = ½gt²
• Velocity squared: v² = 2gs

Example: A ball is dropped from rest. 
What is its velocity after 2 seconds?
Answer: v = 9.8 × 2 = 19.6 m/s
```

### Projectile Motion - Chapter 3: Time of Flight
```
Formula: T = 2v₀sin(θ) / g

Example: 20 m/s at 45°
Calculation: T = 2 × 14.14 / 9.8 = 2.89 seconds
```

---

## 🛠️ File Locations

| File | Purpose |
|------|---------|
| `src/models/Tutorial.ts` | Tutorial schema |
| `src/app/tutorials/[experimentId]/page.tsx` | Tutorial display page |
| `src/app/api/tutorials/route.ts` | API - Get all tutorials |
| `src/app/api/tutorials/[experimentId]/route.ts` | API - CRUD individual tutorial |
| `src/app/dashboard/page.tsx` | Dashboard (updated with buttons) |
| `scripts/seedTutorials.ts` | Seed script with all content |

---

## 🔄 How Updates Work

1. **User/Admin Updates Tutorial** via API or MongoDB
2. **Data Saved** to MongoDB `tutorials` collection
3. **Next Time User Visits** `/tutorials/{experimentId}`
4. **Page Fetches Latest Data** from API
5. **Updated Content Displays** immediately

**No redeployment needed!** 🚀

---

## 📚 Content Structure

Each tutorial follows this structure:

```
Tutorial
├── Chapter 1: Introduction
│   ├── Content
│   ├── Key Points
│   ├── Visual Description
│   └── Examples
├── Chapter 2: Core Concepts
│   ├── Content
│   ├── Key Points
│   ├── Formula
│   └── Examples
├── Chapter 3-N: Advanced Topics
└── Chapter N: Real-World Applications
```

---

## 💡 Future Additions (Easy to Implement)

- [ ] Add video embeds to chapters
- [ ] Add chapter quizzes
- [ ] Track student progress
- [ ] Add discussion/comment section
- [ ] Export tutorials as PDF
- [ ] Search within tutorials
- [ ] Related tutorial suggestions
- [ ] Difficulty-based recommendations

---

## 📞 Quick Reference

**Dashboard**: http://localhost:3000/dashboard  
**Tutorials Root**: http://localhost:3000/tutorials/  
**API Root**: http://localhost:3000/api/tutorials/  
**Database**: MongoDB Atlas - lab.tutorials  

---

## ✅ Checklist

- ✓ 6 complete tutorials created
- ✓ Each has 5-7 chapters
- ✓ Beautiful W3Schools-style layout
- ✓ Stored in MongoDB (easily updatable)
- ✓ "Learn More" buttons in dashboard
- ✓ API endpoints for CRUD
- ✓ No redeployment needed for updates
- ✓ Professional documentation

**Status**: Ready to use! 🚀
