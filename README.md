# AI Student Assistant

A MERN starter for an AI-powered student assistant with:

- Chat with AI
- Image-based question solving
- Study history
- Personalized student dashboard
- Voice input placeholder for a later phase

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- AI: OpenAI Responses API with image input support

## Project Structure

```text
frontend/
backend/
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

Required variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-student-assistant
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
CLIENT_URL=http://localhost:5173
```

## API Routes

- `POST /api/chat`
- `POST /api/upload`
- `GET /api/history`
- `GET /api/history/:sessionId`

## Notes

- Image uploads are stored temporarily in `backend/uploads/`.
- Voice input is represented in the UI as a placeholder action and can be connected later with the Web Speech API or OpenAI Realtime.
