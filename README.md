# Cuemath AI Interview Platform

An AI-powered tutor screening platform that conducts automated 10-minute interviews, evaluates candidates using Google Gemini, and provides detailed assessment reports for admin review.

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 19, Vite, Tailwind CSS v4, Lucide React |
| Backend   | Node.js, Express 4, Mongoose 8 |
| Database  | MongoDB Atlas |
| AI        | Google Gemini 1.5 Flash (evaluation + student chat) |
| Media     | Web Speech API (recognition & synthesis), Canvas API (whiteboard), WebRTC (camera) |

## Folder Structure

```
cuemath-ai-interview/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── components/            # Shared UI components
│       │   ├── ui/
│       │   │   └── ScoreBar.jsx   # Reusable score progress bar
│       │   ├── CameraPiP.jsx      # Picture-in-picture camera overlay
│       │   ├── ErrorBoundary.jsx  # React error boundary
│       │   └── Navbar.jsx         # Logo + Navbar (exports Logo, Navbar)
│       ├── context/
│       │   └── InterviewContext.jsx  # Global interview state
│       ├── hooks/
│       │   ├── useCamera.js          # Camera stream setup
│       │   ├── useSpeechRecognition.js  # Speech-to-text hook
│       │   └── useTimer.js           # Elapsed timer + duration helper
│       ├── lib/
│       │   └── constants.jsx         # QUESTIONS, TOOLS, MOCK_CANDIDATES, etc.
│       ├── pages/
│       │   ├── LandingPage.jsx       # Registration form
│       │   ├── PreInterview.jsx      # Environment checks
│       │   ├── QARound.jsx           # 6-question behavioral Q&A
│       │   ├── TeachingDemo.jsx      # Whiteboard + AI student chat
│       │   ├── InterviewComplete.jsx # Results & Gemini evaluation
│       │   └── AdminDashboard.jsx    # Admin review (3 tabs)
│       └── services/
│           └── api.js               # All API call functions
│
└── server/                        # Express backend
    ├── config/
    │   ├── db.js                  # MongoDB connection
    │   └── index.js               # Env var exports
    ├── controllers/
    │   ├── candidateController.js
    │   ├── chatController.js
    │   ├── evaluateController.js
    │   └── interviewController.js
    ├── middleware/
    │   ├── errorHandler.js        # Global Express error handler
    │   └── validateRequest.js     # Request validation middleware
    ├── models/
    │   ├── Candidate.js
    │   ├── Interview.js
    │   └── Assessment.js
    ├── routes/
    │   ├── candidates.js
    │   ├── chat.js
    │   ├── evaluate.js
    │   └── interviews.js
    ├── utils/
    │   ├── chatPrompts.js         # Gemini chat system prompt + fallbacks
    │   └── evaluation.js         # Evaluation logic, prompt builder, fallback generator
    └── index.js                   # App entry point
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment

Create `server/.env` (copy from `server/.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cuemathinterview?retryWrites=true&w=majority
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Run (Development)

```bash
# Terminal 1 — start backend
cd server && npm run dev

# Terminal 2 — start frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api/health

### Run (Production)

```bash
# Build frontend
cd client && npm run build

# Start server (serves built client + API)
cd server && npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/candidates` | Register a candidate |
| GET  | `/api/candidates` | List all candidates |
| GET  | `/api/candidates/:id` | Get single candidate |
| POST | `/api/interviews/start` | Create interview session |
| POST | `/api/interviews/:id/transcript` | Save Q&A transcript |
| POST | `/api/interviews/:id/teaching-transcript` | Save teaching demo transcript |
| POST | `/api/interviews/:id/complete` | Mark interview complete |
| GET  | `/api/interviews` | List all interviews with assessments |
| POST | `/api/chat` | Get AI student (Arjun) response |
| POST | `/api/evaluate` | Run Gemini evaluation on interview |
| GET  | `/api/health` | Health check + DB status |

## Architecture

The app follows a linear interview flow: **Registration → Pre-Interview checks → Q&A Round → Teaching Demo → AI Evaluation → Results**. The backend persists each step to MongoDB Atlas in real time, with graceful local fallbacks if the DB or Gemini API is unavailable. The admin dashboard fetches from the API first, falling back to `localStorage` for offline demo use.

## 🔮 Future Scope

- 🔐 Google Authentication (already implemented in other projects AInterview  https://ainterview-iota.vercel.app  )  
- 😊 Face Detection for confidence & eye contact tracking  
- 🎙️ Human-like conversational voice AI  
- 🤖 Smart AI student (age-adaptive behavior)/to have better evaluation  
- 📊 ML-based matching system in dashboard to find best teacher
- 📅 Automated (reduce human ops cost)  
