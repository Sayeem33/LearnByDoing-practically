# Free Fall Simulation - Complete Guide

## 🚀 Overview

The Free Fall simulation at `http://localhost:3000/lab/freefall` is now **fully functional** with:
- ✅ Real-time physics simulation using Matter.js
- ✅ Interactive object dragging
- ✅ Live data collection and visualization
- ✅ Professional UI with velocity vectors
- ✅ Data export capabilities
- ✅ Multiple graph visualizations

---

## 🎯 Features

### 1. **Interactive Canvas**
- Beautiful gradient background with grid
- Red ball representing falling object
- **Green ground** at the bottom
- **Velocity vectors** showing direction and magnitude (blue arrows)
- **Position and velocity displays** on the ball
- **Shadow indicator** showing ground reference

### 2. **Real-time Simulation**
- Physics engine running at 60 FPS
- Accurate gravity simulation (g = 9.8 m/s²)
- Velocity accumulation with time
- Position tracking in pixels and meters

### 3. **User Controls**
- **Start Button**: Begin free fall simulation
- **Stop Button**: Pause simulation (appears when running)
- **Reset Button**: Reset ball to initial height
- **Height Slider**: Adjust initial drop height (20-400 pixels)
- All controls disabled during simulation for accuracy

### 4. **Data Collection**
- Automatic data capture every 50ms
- Tracks: time, position, velocity, speed, x, y, vx, vy
- Real-time statistics display
- Export to CSV format

### 5. **Visualizations**
- **Velocity vs Time Graph**: Shows linear increase (constant acceleration)
- **Position vs Time Graph**: Shows parabolic motion (distance = ½gt²)
- **Statistics Panel**: Live max velocity and duration
- **Data Logger Table**: Last 10-100 data points with scroll

---

## 📖 How to Use

### **Step 1: Set Initial Height**
1. Look at the height slider on the right sidebar
2. Drag it to select starting height (e.g., 200px for a good demo)
3. You'll see the orange dashed line move on the canvas
4. The ball will be positioned at that height

### **Step 2: Start Simulation**
1. Click **"Start"** button (green)
2. Watch the ball fall down
3. Notice:
   - The **velocity vector** grows (longer blue arrow)
   - Speed increases in top-right info
   - Graphs begin plotting in real-time

### **Step 3: Monitor in Real-Time**
During simulation, you'll see:
- Ball accelerating downward
- **Velocity display** showing increasing speed
- **Position display** showing current pixel location
- **Live graphs** updating with data points

### **Step 4: Stop & Reset**
- Click **"Stop"** (red) to pause
- Click **"Reset"** (gray) to return ball to initial height
- Data is preserved; you can view/export it

### **Step 5: Analyze Data**
1. **Statistics Panel** shows:
   - Total data points collected
   - Maximum velocity reached
   - Total simulation duration

2. **Graphs show:**
   - Linear velocity increase (constant acceleration)
   - Parabolic position change

3. **Data Logger** displays:
   - Detailed readings of time, position, velocity, speed
   - Scroll down to see all points
   - Last point highlighted in blue

---

## 🔧 Technical Details

### **Physics Calculation**

For free fall motion:

$$d = \frac{1}{2}gt^2$$

$$v = gt$$

Where:
- d = distance (meters)
- v = velocity (m/s)
- g = gravitational acceleration = 9.8 m/s²
- t = time (seconds)

### **Data Capture Format**

Each data point contains:
```javascript
{
  time: 1.234,           // seconds elapsed
  position: 0.123,       // height in meters (calculated)
  velocity: 2.45,        // vertical velocity in m/s
  speed: 2.45,           // total speed magnitude
  x: 400,                // pixel position x
  y: 245,                // pixel position y (top-down)
  vx: 0,                 // velocity x
  vy: 24.01              // velocity y (converted to m/s)
}
```

### **Unit Conversions**

The simulation uses:
- **Canvas/Rendering**: Pixels (screen coordinates)
- **Physics**: Matter.js units with SCALE factor
- **Export/Display**: SI units (meters, m/s, seconds)

Conversion factor: 1 meter = PHYSICS.SCALE pixels (see constants.ts)

---

## 💾 Export Data

### **CSV Export**

Click **"📤 Export"** button to download data as CSV:
```
time,position,velocity,speed,x,y,vx,vy
0.05,0.001,0.49,0.49,400,100,0,7.84
0.10,0.004,0.98,0.98,400,101,0,15.68
0.15,0.011,1.47,1.47,400,103,0,23.52
```

### **Using CSV Data**

1. Open in Excel/Google Sheets
2. Create charts:
   - Plot Time vs Velocity (should be linear)
   - Plot Time vs Position (should be parabolic)
3. Calculate:
   - Slope of velocity line = acceleration ≈ 9.8 m/s²
   - Verify: v(t) = 9.8 × t
   - Verify: d(t) = 0.5 × 9.8 × t²

---

## 🎓 Learning Objectives

When students use this simulation, they can:

1. **Verify Gravitational Acceleration**
   - Measure velocity increase over time
   - Calculate acceleration from slope
   - Compare with theoretical value (9.8 m/s²)

2. **Understand Velocity-Time Relationship**
   - See linear growth of velocity
   - Recognize constant acceleration
   - Predict velocity at any time point

3. **Analyze Position-Time Graphs**
   - Observe parabolic motion
   - Understand non-linear distance increase
   - Relate to d = ½gt² formula

4. **Interpret Velocity Vectors**
   - See direction and magnitude simultaneously
   - Understand vector representation
   - Recognize changing velocity (acceleration)

---

## 🔍 Troubleshooting

### **Issue: Ball doesn't fall**
**Solution**: 
- Click "Start" button
- Check that simulation is running (button should show "Stop")

### **Issue: No data appearing in graphs**
**Solution**:
- Make sure simulation is running
- Wait a few seconds for data to accumulate
- Check that dataPoints array is being populated
- Try resetting and starting again

### **Issue: Graphs show strange values**
**Solution**:
- Ensure correct unit conversions are applied
- Check that PHYSICS.SCALE is set correctly in constants
- Verify time is being measured in seconds

### **Issue: Cannot drag ball before simulation**
**Solution**:
- This is intentional to maintain initial conditions
- Use the height slider instead
- After simulation stops, you can restart with new height

### **Issue: Export button not working**
**Solution**:
- Check browser console for errors
- Ensure data points exist (run simulation first)
- Try different browser if issue persists

---

## 🛠️ Customization

### **Change Initial Height**
In [experimentId]/page.tsx or FreeFallWorkbench.tsx:
```typescript
const [height, setHeight] = useState(100); // Change default
```

### **Adjust Gravity**
In constants.ts:
```typescript
PHYSICS: {
  GRAVITY: 9.8,  // Change this value
  SCALE: 30,
}
```

### **Change Canvas Size**
In FreeFallWorkbench.tsx:
```tsx
<canvas 
  width={800}   // Change width
  height={500}  // Change height
  ...
/>
```

### **Modify Data Capture Rate**
In FreeFallWorkbench.tsx:
```typescript
const FREEFALL_CAPTURE_INTERVAL = 50; // milliseconds (lower = more points)
```

### **Change Ball Color**
In FreeFallWorkbench.tsx:
```typescript
engine.spawnBall(400, height, 20, { color: '#ef4444' }); // Modify color hex
```

---

## 📊 Example Results

### **Expected Output for h=200px, starting fresh:**

```
Time (s)  │ Distance (m) │ Velocity (m/s) │ Speed (m/s)
─────────────────────────────────────────────────────
0.0       │ 0.00        │ 0.00          │ 0.00
0.1       │ 0.05        │ 0.98          │ 0.98
0.2       │ 0.20        │ 1.96          │ 1.96
0.3       │ 0.44        │ 2.94          │ 2.94
0.4       │ 0.78        │ 3.92          │ 3.92
0.5       │ 1.23        │ 4.90          │ 4.90
```

**Observations:**
- Velocity increases linearly: v = 9.8t
- Distance increases quadratically: d = 4.9t²
- Velocity increases by ~10 m/s every second

---

## 🎮 Interactive Tips

### **For Teachers**
1. Use initial setup to demonstrate concepts
2. Have students predict landing time: t = √(2h/g)
3. Compare multiple heights and measure accuracy
4. Export data for further analysis in spreadsheets
5. Calculate theoretical values and compare with actual

### **For Students**
1. Try different heights and observe patterns
2. Watch velocity vector grow
3. Look for linear relationship in velocity graph
4. Challenge: Calculate g from your data
5. Compare results with 9.8 m/s² theoretical value

---

## 🔗 Related Documentation

- [Physics Engine Guide](./PHYSICS_ENGINE_GUIDE.md)
- [Simulation Architecture](./ARCHITECTURE.md)
- [API Routes](./API_DOCUMENTATION.md)
- [Tutorial System](./TUTORIALS_QUICK_START.md)

---

## 📝 Component Structure

```
/lab/[experimentId]/page.tsx          Main lab workspace
├── PhysicsLayer.tsx                   Canvas renderer & physics
│   └── Matter.js engine + Mouse constraint
├── FreeFallWorkbench.tsx (optional)   Alternative full-featured version
├── Toolbar.tsx                        Tool selection
├── LiveChart.tsx                      Velocity vs Time graph
├── VelocityGraph.tsx                  Velocity visualization
├── PositionGraph.tsx                  Position visualization
├── DataLogger.tsx                     Data table display
└── ExportBtn.tsx                      CSV export

/engine/
├── PhysicsEngine.ts                   Core Matter.js wrapper
└── physics/
    └── freeFallEngine.ts              Free fall specific logic

/hooks/
└── useDataStream.ts                   Data capture management
```

---

## ⚙️ Configuration Constants

From `src/lib/constants.ts`:

```typescript
PHYSICS: {
  GRAVITY: 9.8,
  SCALE: 30,
}

CANVAS: {
  WIDTH: 1200,
  HEIGHT: 600,
  GRID_SIZE: 50,
  BACKGROUND_COLOR: '#f9fafb',
}
```

---

## 🚀 Next Steps

1. **Test the simulation**: Visit `http://localhost:3000/lab/freefall`
2. **Try different heights**: Move slider, observe landing times
3. **Export data**: Click export and analyze in spreadsheet
4. **Challenge calculations**: Use data to calculate g from first principles
5. **Compare theories**: Check if results match d = ½gt², v = gt

---

## ✅ Feature Checklist

- [x] Free fall physics simulation
- [x] Drag and drop support (via Matter.js MouseConstraint)
- [x] Real-time data collection
- [x] Velocity vector visualization
- [x] Multiple graph types (velocity, position)
- [x] Data export (CSV)
- [x] Statistics display
- [x] Professional UI
- [x] Mobile responsive
- [x] Theory information display
- [x] Educational objectives shown
- [x] Reset functionality
- [x] Data persistence during session

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review component source code with comments
3. Check browser console for detailed error messages
4. Verify all dependencies are installed: `npm install`
5. Restart development server: `npm run dev`

---

**Happy simulating!** 🎓✨
