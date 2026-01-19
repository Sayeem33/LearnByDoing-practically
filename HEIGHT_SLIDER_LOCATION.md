# 📍 Where is the Height Slider? - Visual Guide

## 🎯 Location on the Page

The **height slider** is now visible on the **RIGHT SIDEBAR** when you go to:
```
http://localhost:3000/lab/freefall
```

---

## 🖼️ Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔙 Back  |  Free Fall  |  Show Tutorial  |  💾 Save        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────┬───────────────┐
│                                             │               │
│  TOOLBAR                   MAIN AREA        │ RIGHT SIDEBAR │
│  (Left)                    (Center)         │ (Right)       │
│                                             │               │
│  • Ball tool         [Canvas with ball]     │ ⚙️ SETUP      │
│  • Box tool          [Gradient bg]          │ Height slider │
│  • Ramp tool         [Grid lines]           │ ━━━●━━━ 250px │
│  • Pendulum          [Red ball]             │               │
│                      [Velocity vector]      │ 📐 Formulas   │
│                                             │ v = gt        │
│                                             │ d = ½gt²      │
│  [▶ Start] [Reset]                          │               │
│  Time: 0.00s                                │ 📈 Charts     │
│                                             │ (below setup) │
│                                             │               │
└─────────────────────────────────────────────┴───────────────┘
```

---

## 🎯 Height Slider - Exact Location

### **On Desktop (Large Screen):**
```
RIGHT COLUMN (Width: 25%)
│
├─ TOP: ⚙️ Experiment Setup (CARD)
│  │
│  ├─ Title: "⚙️ Experiment Setup"
│  │
│  ├─ Height Control Section:
│  │  │
│  │  ├─ Label: "Initial Height: 250px" 
│  │  │
│  │  ├─ SLIDER: ━━━●━━━━━━━━━━ (THIS IS IT!)
│  │  │            ^
│  │  │            Drag this side to side
│  │  │
│  │  ├─ Range: 20px (min) to 400px (max)
│  │  │
│  │  └─ Helper text: "Set height before clicking Start"
│  │
│  ├─ Formula Box (Blue background):
│  │  │
│  │  ├─ v = gt
│  │  ├─ d = ½gt²
│  │  └─ g = 9.8 m/s²
│
├─ BELOW: 📈 Velocity Chart
│
└─ BELOW: 📉 Position Chart
```

### **On Mobile (Small Screen):**
The layout stacks vertically, so:
1. Scroll to the RIGHT (swipe left)
2. You'll see the **HEIGHT SLIDER** at the TOP of the right column

---

## 📱 Mobile View

```
If you're on MOBILE, the layout is STACKED:

Top: Header (Back, Title, Save)

Middle: Canvas area
         [Red ball falling]
         [Grid background]

Bottom: After you scroll DOWN:
        └─ ⚙️ Experiment Setup
           Height Slider ━━●━━
           Formulas
           Charts
           Data Logger
```

---

## ✅ What You Should See

### **When Correct:**
- ✅ Card labeled "⚙️ Experiment Setup"
- ✅ Text saying "Initial Height: XXXpx"
- ✅ Horizontal slider bar below it
- ✅ Can drag slider left/right
- ✅ Number changes as you drag
- ✅ Orange dashed line appears on canvas showing height

### **Step-by-Step to Find It:**

1. **Go to**: `http://localhost:3000/lab/freefall`
2. **Look RIGHT**: Find the right column (25% width)
3. **Look UP**: At the very top of right column
4. **Find**: Card with "⚙️ Experiment Setup"
5. **Inside that card**: You'll see "Initial Height: XXXpx"
6. **Below that**: The slider bar to drag

---

## 🖱️ How to Use It

```
1. LOCATE: Find the slider in the right sidebar
   ━━━●━━━━━━━━━━

2. DRAG LEFT: To decrease height
   ━●━━━━━━━━━━━

3. DRAG RIGHT: To increase height
   ━━━━━━━━━━━●━

4. WATCH: Canvas shows orange line at your selected height
   
5. CLICK START: Begin the simulation at that height
```

---

## 🔍 If You Still Don't See It

**Check these things:**

| Check | What to Do |
|-------|-----------|
| Not on freefall page? | Go to: `http://localhost:3000/lab/freefall` |
| On mobile? | Scroll down or to the right |
| Slider disabled? | Click "Reset" button first |
| Page not updated? | Refresh: Ctrl+R (Windows) or Cmd+R (Mac) |
| Still nothing? | Check browser console for errors |

---

## 💡 Quick Identification

**Look for this pattern:**
```
┌─────────────────────────┐
│ ⚙️ Experiment Setup     │ ← This card
├─────────────────────────┤
│ Initial Height: 250px   │ ← This text
│                         │
│ ━━━━●━━━━━━━━━━━━━━    │ ← THIS IS THE SLIDER!
│                         │
│ Set height before...    │
└─────────────────────────┘
```

---

## 🎯 Visual Indicator

When you **drag the height slider**:
- The number next to it changes (20-400)
- An **orange dashed line** appears on the canvas
- This shows where the ball will start falling from

```
BEFORE:
┌─────────────┐
│             │
│   🔴        │ (No dashed line)
│             │
│ ═════════   │
└─────────────┘

AFTER (moving slider):
┌─────────────┐
│             │
│ ············│ ← Orange dashed line
│   🔴        │
│             │
│ ═════════   │
└─────────────┘
```

---

## ✅ You Found It!

Once you see the slider, you can:

1. **Drag it** to adjust height (20-400px)
2. **Watch** the orange line move on canvas
3. **Click Start** to begin simulation
4. **See** ball fall from that height
5. **Export** data when done

---

**Can't find it?** 
- Refresh the page: `Ctrl+R`
- Check you're at: `http://localhost:3000/lab/freefall`
- Look in the **right column** at the **top**
- You should see "⚙️ Experiment Setup" card

It's there! Look for the **SLIDER BAR** in the right sidebar! 📍✨
