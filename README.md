# SimuLab - Virtual Science Laboratory

> An interactive physics and chemistry simulation platform built with Next.js, Matter.js, and MongoDB. Designed for CSE 3200 Software Engineering course project.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Matter.js](https://img.shields.io/badge/Matter.js-0.19-green)](https://brm.io/matter-js/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

---

## 🎯 Project Overview

SimuLab is a **Virtual Science Laboratory** that allows students to perform interactive physics and chemistry experiments through a web-based simulation engine. This project demonstrates **Complex Engineering Problems (CO1)** by implementing real-time physics calculations, state management, and data analysis.

### Key Features

- ✅ **Real-time Physics Simulation** - Matter.js powered 2D physics engine
- ✅ **Chemistry Reaction Engine** - Custom state machine for chemical reactions
- ✅ **Live Data Analysis** - Real-time graphing with Recharts
- ✅ **Experiment Persistence** - MongoDB integration for saving experiments
- ✅ **Interactive Tutorials** - Step-by-step learning guides
- ✅ **Data Export** - CSV and chart image export functionality
- ✅ **Responsive Design** - Modern glassmorphism UI with Tailwind CSS

---

## 🏗️ Architecture

### System Design (CO2 - Modern Tools)

```
Client-Side Simulation Engine with Cloud Persistence

┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Canvas     │  │   Toolbar    │  │  Live Chart  │     │
│  │   Stage      │  │  (Objects)   │  │  (Recharts)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Core Engine (Logic Layer)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Physics    │  │  Chemistry   │  │  Simulation  │     │
│  │  Engine      │  │    Core      │  │     Loop     │     │
│  │ (Matter.js)  │  │ (State M/C)  │  │ (Delta Time) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Next.js API Routes)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   /api/      │  │   /api/      │  │   /api/      │     │
│  │ experiments  │  │    auth      │  │   teacher    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (MongoDB)                        │
│        ┌──────────────┐         ┌──────────────┐           │
│        │    Users     │         │ Experiments  │           │
│        │  Collection  │         │  Collection  │           │
│        └──────────────┘         └──────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/simulab-engine.git
cd simulab-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/simulab

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App Configuration
NODE_ENV=development
```

4. **Start MongoDB**

If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas, ensure your connection string is correct in `.env.local`.

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Available Experiments

### Physics Module

1. **Free Fall** - Verify g = 9.8 m/s²
2. **Projectile Motion** - Analyze parabolic trajectories
3. **Simple Pendulum** - Study periodic motion
4. **Elastic Collision** - Momentum and energy conservation

### Chemistry Module

1. **Acid-Base Neutralization** - HCl + NaOH → NaCl + H₂O
2. **Titration** - Determine concentration using pH indicators
3. **Gas Laws** - PV = nRT simulation

---

## 🧪 Core Engineering Challenges (CO1)

### 1. The Time-Step Problem

**Challenge:** Simulation speed varies with device performance.

**Solution:** Implemented **Delta Time (dt) correction** in `SimulationLoop.ts`:

```typescript
const deltaTime = timestamp - lastTimestamp;
const clampedDelta = Math.min(deltaTime, targetFrameTime * 2);
physicsEngine.step(clampedDelta);
```

### 2. Collision Tunneling

**Challenge:** Fast objects passing through thin walls.

**Solution:** Enabled **Continuous Collision Detection (CCD)** in Matter.js configuration.

### 3. State Synchronization

**Challenge:** Syncing React DOM with Matter.js without lag.

**Solution:** Used **`useRef` instead of `useState`** for high-frequency updates:

```typescript
// Direct DOM manipulation for physics objects
canvasRef.current.getContext('2d').drawImage(...);
```

---

## 📊 Course Outcomes (CO) Alignment

| CO | Requirement | Implementation |
|---|---|---|
| **CO1** | Complex Engineering Problems | Physics loop with delta-time correction, collision detection, state machine for chemistry |
| **CO2** | Modern Tools | Next.js 14, Matter.js, Recharts, MongoDB, TypeScript |
| **CO3** | Communication | Automated lab reports, CSV export, chart image generation |
| **CO4** | Teamwork | Modular architecture: Physics Engine, Chemistry Core, API Routes |

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Simulation Engine
- **Matter.js** - 2D physics engine
- **Custom Chemistry Core** - Reaction state machine
- **Simulation Loop** - Delta-time game loop

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB + Mongoose** - Database and ODM
- **NextAuth.js** - Authentication (optional)

---

## 📂 Project Structure

```
simulab-engine/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # User dashboard
│   │   ├── lab/[experimentId]/  # Main lab workspace
│   │   └── api/               # Backend API routes
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── workbench/        # Canvas, Toolbar, Physics layer
│   │   └── analysis/         # Charts, Data logger, Export
│   │
│   ├── engine/               # Core simulation logic
│   │   ├── PhysicsEngine.ts  # Matter.js wrapper
│   │   ├── ChemistryCore.ts  # Reaction engine
│   │   └── SimulationLoop.ts # Delta-time game loop
│   │
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and constants
│   └── models/               # MongoDB schemas
│
├── public/                   # Static assets
├── .env.local               # Environment variables
├── package.json
└── README.md
```

---

## 🎨 UI Features

### Glassmorphism Design
Modern, translucent UI with backdrop blur effects.

### Real-time Graphing
Live velocity-time and position-time plots using Recharts.

### Data Export
- **CSV Export** - Raw data for Excel analysis
- **Chart Image Export** - PNG screenshots using html2canvas
- **Lab Report Generator** - Text-based summary with statistics

---

## 🔬 Usage Example

### Creating a Free Fall Experiment

1. Navigate to Dashboard
2. Click "Free Fall" template
3. Click on canvas to add a ball
4. Click "Start Simulation"
5. Observe real-time velocity graph
6. Export data to CSV

### Performing Acid-Base Reaction

1. Select "Acid-Base Reaction" template
2. Click "Add HCl" button
3. Click "Add NaOH" button
4. Observe color change and temperature increase
5. View reaction history

---

## 🧪 API Endpoints

### Experiments

```typescript
GET    /api/experiments          # Get all experiments
POST   /api/experiments          # Create new experiment
GET    /api/experiments/:id      # Get specific experiment
PUT    /api/experiments/:id      # Update experiment
DELETE /api/experiments/:id      # Delete experiment
```

### Example Request

```javascript
const response = await fetch('/api/experiments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    title: 'Free Fall Experiment',
    category: 'physics',
    experimentType: 'freefall',
    state: { objects: [...], dataPoints: [...] }
  })
});
```

---

## 🎓 For Viva/Presentation

### Key Points to Highlight

1. **Complex Problem Solving (CO1)**
   - Delta-time correction ensures accurate physics across devices
   - Custom collision detection prevents tunneling
   - State synchronization using refs for performance

2. **Modern Tools (CO2)**
   - Full-stack TypeScript with Next.js 14
   - Matter.js for professional-grade physics
   - MongoDB for scalable data persistence

3. **Communication (CO3)**
   - Automated lab report generation
   - Interactive tutorials guide learning
   - Data export for external analysis

4. **Engineering Relevance**
   - Real-world application in education
   - Scalable architecture for adding experiments
   - Performance-optimized for smooth 60 FPS

---

## 📈 Future Enhancements

- [ ] 3D simulations with React Three Fiber
- [ ] Multiplayer collaborative experiments
- [ ] AI-powered experiment suggestions
- [ ] Mobile app version
- [ ] Teacher dashboard with analytics
- [ ] Virtual lab assignments system

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Your Name** - Core Simulation Engine & Frontend
- **Partner Name** - Database Schema & API Routes

---

## 🙏 Acknowledgments

- KUET CSE Department
- CSE 3200 Course Instructors
- Matter.js Documentation
- Next.js Community

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact:
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

**Built with ❤️ for Science Education**