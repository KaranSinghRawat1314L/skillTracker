# SkillTracker — AI-Powered Skill Assessment Platform

A full-stack web application that lets users track technical skills, generate AI-powered quizzes via Gemini, and analyse performance through visual dashboards.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Recharts  |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB Atlas (Mongoose ODM)            |
| File Store | MongoDB GridFS (profile pictures)       |
| Auth       | JWT + Google OAuth 2.0                  |
| AI         | Google Gemini 2.0 Flash                 |

---

## Project Structure

```
skilltracker/
├── backend/
│   ├── config/        # DB connection + GridFS init
│   ├── controllers/   # HTTP request handlers (thin layer)
│   ├── services/      # Business logic
│   ├── models/        # Mongoose schemas
│   ├── middleware/     # JWT auth guard
│   ├── routes/        # Express routers
│   └── server.js
└── frontend/
    └── src/
        ├── components/ # Navbar, shared UI primitives
        ├── hooks/      # useAuth
        ├── pages/      # One file per route
        └── utils/      # Axios instance
```

---

## Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### Backend

```bash
cd backend
cp .env.example .env          # fill in your values
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`.

---

## Environment Variables (backend/.env)

| Variable         | Description                          |
|------------------|--------------------------------------|
| PORT             | Server port (default 5000)           |
| MONGODB_URI      | MongoDB connection string            |
| JWT_SECRET       | Secret for signing JWT tokens        |
| GOOGLE_CLIENT_ID | Google OAuth client ID               |
| GEMINI_API_KEY   | Gemini AI API key                    |
| GEMINI_API_URL   | Gemini endpoint (default provided)   |
| FRONTEND_URL     | CORS origin (e.g. http://localhost:5173) |

---

## Docker

```bash
# Copy and fill in backend env
cp backend/.env.example backend/.env

# Build and start all services
docker-compose up --build
```

App is available at `http://localhost`.

---

## API Reference

### Auth
| Method | Path               | Description              |
|--------|--------------------|--------------------------|
| POST   | /api/auth/signup   | Register with email      |
| POST   | /api/auth/login    | Login with email         |
| POST   | /api/auth/google   | Login / register via Google |

### Users
| Method | Path                         | Description              |
|--------|------------------------------|--------------------------|
| GET    | /api/users/me                | Get current user         |
| PUT    | /api/users/me                | Update display name      |
| PUT    | /api/users/address           | Update address + mobile  |
| POST   | /api/users/profile-pic       | Upload avatar (GridFS)   |
| GET    | /api/users/profile-pic/:id   | Stream avatar from GridFS|
| DELETE | /api/users/me                | Delete account           |

### Skills
| Method | Path              | Query params              | Description        |
|--------|-------------------|---------------------------|--------------------|
| GET    | /api/skills       | ?search=&difficulty=      | List skills        |
| POST   | /api/skills       | —                         | Create skill       |
| GET    | /api/skills/:id   | —                         | Get skill          |
| PUT    | /api/skills/:id   | —                         | Update skill       |
| DELETE | /api/skills/:id   | —                         | Delete skill       |

### Quizzes
| Method | Path                         | Description              |
|--------|------------------------------|--------------------------|
| POST   | /api/quizzes/generate        | Generate AI quiz         |
| GET    | /api/quizzes                 | Get all user quizzes     |
| GET    | /api/quizzes/skill/:skillId  | Get quizzes for a skill  |
| GET    | /api/quizzes/:id             | Get single quiz          |

### Results
| Method | Path                       | Description              |
|--------|----------------------------|--------------------------|
| POST   | /api/results/evaluate      | Submit + evaluate quiz   |
| GET    | /api/results/me            | Get all user results     |
| GET    | /api/results/quiz/:quizId  | Get result for a quiz    |
