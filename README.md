# Cuemath AI Tutor Screener

AI-powered interview platform for screening tutor candidates.

## Setup

```bash
cd server && npm install
cp .env.example .env   # then fill in your Gemini API key
cd ../client && npm install
```

## Run (Development)

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`

## Run (Production)

```bash
cd client && npm run build
cd ../server && node index.js
```

Open `http://localhost:5000`

## Features

- Pre-interview environment checks (camera, mic, speaker, internet)
- AI-powered Q&A round with speech recognition + text input fallback
- Teaching demo with whiteboard and AI student simulation
- Automated evaluation via Gemini AI with realistic fallback
- Admin dashboard for reviewing and comparing candidates
