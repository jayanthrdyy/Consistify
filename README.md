# ⚡ Consistify — Productivity Tracking Platform

A modern, full-stack productivity and consistency tracking app built with React, Node.js, Express, and MongoDB Atlas.

---

## 🚀 Tech Stack

**Frontend:** React + Vite · Tailwind CSS · Framer Motion · React Router · Recharts · Lucide Icons · @dnd-kit

**Backend:** Node.js · Express.js · MongoDB Atlas · Mongoose · JWT · bcryptjs

---

## 📁 Project Structure

```
consistify/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Route pages
│       ├── context/     # Auth + Theme context
│       ├── services/    # Axios API service
│       └── layouts/     # App layout
└── server/              # Express backend
    ├── controllers/     # Business logic
    ├── models/          # Mongoose schemas
    ├── routes/          # API routes
    ├── middleware/       # JWT auth middleware
    └── server.js        # Entry point
```

---

## ⚙️ Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas/database) → Create free cluster
2. Under **Database Access** → Add a database user (username + password)
3. Under **Network Access** → Add IP `0.0.0.0/0` (or your specific IP)
4. Click **Connect** → **Connect your application** → Copy the connection string

### 2. Backend Setup

```bash
cd server

# Create environment file
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/consistify?retryWrites=true&w=majority
JWT_SECRET=your_very_long_secret_key_here_make_it_random
CLIENT_URL=http://localhost:5173
```

```bash
# Install dependencies
npm install

# Start server (development)
npx nodemon server.js

# Or production
node server.js
```

Server runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PUT | `/api/tasks/reorder` | Reorder tasks |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Full analytics data |
| GET | `/api/analytics/streaks` | Streak data only |

---

## ✨ Features

- **Authentication** — JWT-based auth with persistent sessions
- **Dashboard** — Live clock, greeting, streak stats, today's tasks
- **Task Manager** — CRUD, drag-and-drop reorder, search + filter
- **Analytics** — Pie chart, weekly bar chart, monthly line chart, category table
- **Heatmap Calendar** — GitHub-style activity heatmap
- **Productivity Insights** — Most productive day, strongest/weakest habits
- **Dark/Light Mode** — Persistent theme toggle
- **Streaks** — Auto-tracked based on daily task completion
- **Animations** — Framer Motion throughout

---

## 🎨 Design System

- **Display Font:** Syne (headers, titles)
- **Body Font:** DM Sans (body, labels)
- **Primary:** Indigo/Violet gradient (#6366f1 → #8b5cf6)
- **Style:** Premium SaaS dark-first with light mode support

---

## 🏗️ Production Deployment

**Backend:** Deploy to Railway, Render, or Heroku
**Frontend:** Deploy to Vercel or Netlify

Set `VITE_API_URL` in client if deploying separately, and update `CLIENT_URL` in server `.env`.
