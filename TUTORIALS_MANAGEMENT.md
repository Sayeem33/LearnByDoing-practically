# Tutorial Management Guide

## 📋 Managing Your Tutorials

This guide shows you how to manage tutorial content in your SimuLab platform without redeploying.

---

## 🔍 View Tutorials

### View All Tutorials
```bash
curl http://localhost:3000/api/tutorials
```

### View Specific Tutorial
```bash
curl http://localhost:3000/api/tutorials/freefall
```

### Filter by Category
```bash
# Physics tutorials only
curl http://localhost:3000/api/tutorials?category=physics

# Chemistry tutorials only
curl http://localhost:3000/api/tutorials?category=chemistry
```

### Filter by Difficulty
```bash
# Beginner tutorials
curl http://localhost:3000/api/tutorials?difficulty=beginner

# Intermediate tutorials
curl http://localhost:3000/api/tutorials?difficulty=intermediate

# Advanced tutorials
curl http://localhost:3000/api/tutorials?difficulty=advanced
```

---

## ✏️ Update Tutorials

### Update Tutorial Description
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New description of the tutorial"
  }'
```

### Update Learning Objectives
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "objectives": [
      "New objective 1",
      "New objective 2",
      "New objective 3"
    ]
  }'
```

### Update Prerequisites
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "prerequisites": [
      "Understanding of algebra",
      "Basic calculus",
      "Vector concepts"
    ]
  }'
```

### Update Duration
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 20
  }'
```

---

## 📖 Update Chapter Content

### Add a New Chapter
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "chapters": [
      {
        "chapterNumber": 6,
        "title": "Advanced Applications",
        "content": "Detailed content about advanced applications of free fall...",
        "keyPoints": [
          "Point 1",
          "Point 2",
          "Point 3"
        ],
        "visualDescription": "Show diagrams of...",
        "formula": "New formulas...",
        "examples": [
          {
            "title": "Example 1",
            "description": "Problem statement",
            "calculation": "Solution steps"
          }
        ]
      }
    ]
  }'
```

### Update Specific Chapter
Get the current tutorial, modify the chapter, and send back all chapters:

```bash
# Step 1: Get current tutorial
curl http://localhost:3000/api/tutorials/freefall > freefall.json

# Step 2: Edit the JSON file (modify chapter content)

# Step 3: Send updated chapters back
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d @freefall.json
```

---

## 🔗 Update References

### Add External References
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "references": [
      {
        "title": "Khan Academy - Free Fall",
        "url": "https://www.khanacademy.org/..."
      },
      {
        "title": "Wikipedia - Free Fall",
        "url": "https://en.wikipedia.org/wiki/Free_fall"
      },
      {
        "title": "PhET Simulations",
        "url": "https://phet.colorado.edu"
      }
    ]
  }'
```

---

## 🏷️ Update Related Topics

### Add Related Topics
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "relatedTopics": [
      "Projectile Motion",
      "Energy Conservation",
      "Kinematics",
      "Newton Laws",
      "Circular Motion"
    ]
  }'
```

---

## 🗂️ MongoDB Direct Updates

If you prefer to use MongoDB directly:

### Connect to MongoDB
```bash
# Using MongoDB Compass or Atlas web interface
# Database: lab
# Collection: tutorials
```

### Find Tutorial
```javascript
db.tutorials.findOne({ experimentId: "freefall" })
```

### Update Tutorial
```javascript
db.tutorials.updateOne(
  { experimentId: "freefall" },
  {
    $set: {
      "description": "New description",
      "duration": 20,
      "objectives": ["New objective 1", "New objective 2"]
    }
  }
)
```

### Update Specific Chapter
```javascript
db.tutorials.updateOne(
  { experimentId: "freefall", "chapters.chapterNumber": 1 },
  {
    $set: {
      "chapters.$.title": "New Chapter Title",
      "chapters.$.content": "New content here..."
    }
  }
)
```

### Add New Chapter
```javascript
db.tutorials.updateOne(
  { experimentId: "freefall" },
  {
    $push: {
      chapters: {
        chapterNumber: 6,
        title: "Advanced Topics",
        content: "Content...",
        keyPoints: ["Point 1", "Point 2"],
        visualDescription: "Description...",
        formula: "Formula...",
        examples: []
      }
    }
  }
)
```

---

## 🎯 Common Update Scenarios

### Scenario 1: Add More Examples to a Chapter

```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "chapters": [
      {
        "chapterNumber": 2,
        "title": "Equations of Motion",
        "content": "Existing content...",
        "keyPoints": ["Existing points..."],
        "visualDescription": "Existing description...",
        "formula": "v = gt, s = ½gt²",
        "examples": [
          {
            "title": "Example 1: Velocity after 2 seconds",
            "description": "A ball is dropped from rest. Find velocity after 2 seconds.",
            "calculation": "v = gt = 9.8 × 2 = 19.6 m/s"
          },
          {
            "title": "Example 2: Distance fallen in 3 seconds",
            "description": "How far does a ball fall in 3 seconds?",
            "calculation": "s = ½gt² = ½ × 9.8 × 9 = 44.1 m"
          },
          {
            "title": "Example 3: NEW EXAMPLE",
            "description": "A ball falls 50 meters. Find velocity.",
            "calculation": "v = √(2gs) = √(2 × 9.8 × 50) = 31.3 m/s"
          }
        ]
      }
    ]
  }'
```

### Scenario 2: Correct a Typo
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Fixed description without typo"
  }'
```

### Scenario 3: Update Difficulty Level
```bash
curl -X PUT http://localhost:3000/api/tutorials/freefall \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "intermediate"
  }'
```

### Scenario 4: Add New Prerequisites
```bash
curl -X PUT http://localhost:3000/api/tutorials/projectilemotion \
  -H "Content-Type: application/json" \
  -d '{
    "prerequisites": [
      "Free Fall",
      "Vector components",
      "Trigonometry basics",
      "Understanding of force"
    ]
  }'
```

---

## 🔄 Workflow for Updating Content

### Option A: Quick Updates via API

1. **Identify what to change**
   - Tutorial ID: `freefall`, `projectilemotion`, `pendulum`, etc.
   - What to change: description, objectives, chapters, etc.

2. **Prepare the JSON**
   - Only include fields to update
   - Keep structure valid

3. **Send to API**
   ```bash
   curl -X PUT http://localhost:3000/api/tutorials/{experimentId} \
     -H "Content-Type: application/json" \
     -d '{fields-to-update}'
   ```

4. **Verify Changes**
   - Visit the tutorial page
   - Refresh browser (Ctrl+R)
   - Changes appear instantly

### Option B: Complete Tutorial Replacement

1. **Get current tutorial**
   ```bash
   curl http://localhost:3000/api/tutorials/freefall > freefall.json
   ```

2. **Edit the file** with all new content

3. **Send back**
   ```bash
   curl -X PUT http://localhost:3000/api/tutorials/freefall \
     -H "Content-Type: application/json" \
     -d @freefall.json
   ```

### Option C: MongoDB Direct Management

1. **Connect to MongoDB Atlas**
2. **Navigate to lab.tutorials collection**
3. **Find tutorial by experimentId**
4. **Edit document**
5. **Save changes**

---

## 📊 Current Tutorial Inventory

### Physics Tutorials
- **freefall** (5 chapters) - Update-ready ✅
- **projectilemotion** (6 chapters) - Update-ready ✅
- **pendulum** (6 chapters) - Update-ready ✅
- **collision** (6 chapters) - Update-ready ✅

### Chemistry Tutorials
- **acidbase** (6 chapters) - Update-ready ✅
- **titration** (7 chapters) - Update-ready ✅

---

## ⚠️ Update Best Practices

1. **Test after updating**: Visit tutorial page to verify
2. **Keep backups**: Save original JSON before major changes
3. **Use descriptive titles**: Help students understand content
4. **Verify formulas**: Double-check mathematical accuracy
5. **Check examples**: Ensure calculations are correct
6. **Link references**: Include authoritative sources
7. **Update timestamps**: MongoDB `updatedAt` is automatic

---

## 🚨 Common Issues & Solutions

### Issue: Changes not showing up

**Solution**: 
- Hard refresh: Ctrl+Shift+R
- Clear cache: DevTools → Application → Clear Storage
- Check API response: `curl http://localhost:3000/api/tutorials/freefall`

### Issue: Syntax errors in update

**Solution**:
- Validate JSON: Use `jsonlint.com`
- Check quotes: Use double quotes for JSON
- Escape special characters

### Issue: Large update fails

**Solution**:
- Break into smaller updates
- Update chapters in separate requests
- Check API logs for specific error

### Issue: Want to revert to original

**Solution**:
```bash
npm run seed:tutorials
```
This resets all tutorials to original state.

---

## 📱 Mobile Consideration

When updating tutorials, remember:
- Keep line lengths reasonable
- Test on mobile browsers
- Use clear section breaks
- Avoid large images/embeds

---

## 🎓 Training for Content Managers

### For Adding New Chapter:
1. Follow chapter template
2. Include all 7 sections (when applicable)
3. Add 2-3 examples minimum
4. Proofread content

### For Updating Existing:
1. Get current version first
2. Make targeted changes
3. Test on tutorial page
4. Document what was changed

### For Monitoring Usage:
- Check API logs for frequently accessed tutorials
- Track which chapters get most views
- Gather student feedback
- Update content based on common questions

---

## ✅ Checklist Before Publishing Update

- [ ] Content is accurate
- [ ] Examples are calculated correctly
- [ ] References are valid links
- [ ] Formatting is consistent
- [ ] Images/descriptions are clear
- [ ] No typos or grammar errors
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Compared with original content

---

## 📞 Need Help?

Refer to:
- `TUTORIALS_DOCUMENTATION.md` - Full technical docs
- `TUTORIALS_QUICK_START.md` - Quick reference
- MongoDB documentation for direct queries
- API response examples above

**Happy updating!** 🚀
