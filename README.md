# Customer Support Ticket Agent

An agentic AI system for managing customer support tickets. Customers raise tickets through a dedicated portal and an AI agent autonomously analyses, categorises, and resolves each ticket — or escalates it to an executive when human intervention is needed.

---

## Features

### Customer Portal
- Register and login securely
- Raise support tickets with subject and description
- View all personal tickets with real-time agent activity timeline
- See AI resolution or escalation status per ticket

### Executive Portal
- Separate login with elevated access
- View all tickets across all customers
- Stats dashboard — total, open, escalated, resolved
- Filter tickets by status
- View full agent reasoning, RAG context, and conversation history
- Manually override ticket status

### Agentic AI Workflow
- Agent seizes every ticket automatically on submission
- RAG retrieves relevant knowledge base documents using semantic search
- Groq LLM (120b model) reasons through the ticket and returns a structured decision
- Agent sets priority, category, and status autonomously
- Resolved tickets trigger a resolution email to the customer
- Escalated tickets trigger an escalation email to the executive team
- Every agent step is logged into the ticket's conversation history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Agent Framework | AutoGen v0.4 |
| LLM | Groq API (LLaMA 120b) |
| RAG | SentenceTransformers + FAISS |
| Primary Database | PostgreSQL (Neon) |
| Secondary Database | MongoDB (Atlas) |
| Auth | JWT + bcrypt |
| Email | SMTP (Gmail) |

---

## Architecture

```
Customer Portal (React)          Executive Portal (React)
        |                                  |
        └──────────── FastAPI Backend ─────┘
                            |
              ┌─────────────┼─────────────┐
              |             |             |
        PostgreSQL     AutoGen Agent   MongoDB
        (users,        (RAG + Groq)   (tickets,
        executives)         |          logs,
                     ┌──────┴──────┐   traces)
                  Resolve       Escalate
                     |             |
              Email customer  Email executive
```

---

## Database Design

**PostgreSQL** — identity and access
- `users` — customer accounts (id, name, email, password_hash, role_id, is_active)
- `executives` — executive accounts (id, name, email, password_hash, is_active)
- `roles` — customer / executive

**MongoDB** — ticket lifecycle
- `conversation_logs` — full ticket document including status, priority, category, agent reasoning, conversation history, escalation trail, RAG context snapshot, resolution summary

---

## Project Structure

```
customer-support-agent/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── .env                    # not committed
│   ├── routers/
│   │   ├── auth.py
│   │   ├── tickets.py
│   │   └── executive.py
│   ├── agents/
│   │   ├── agent.py
│   │   ├── rag.py
│   │   └── email_service.py
│   ├── auth/
│   │   ├── auth_handler.py
│   │   └── dependencies.py
│   └── db/
│       ├── postgres.py
│       ├── mongo.py
│       ├── pg_models.py
│       ├── mongo_schemas.py
│       ├── schemas.py
│       ├── init_db.py
│       └── seed.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── CustomerLogin.jsx
        │   ├── CustomerRegister.jsx
        │   ├── RaiseTicket.jsx
        │   ├── CustomerDashboard.jsx
        │   └── ExecutiveDashboard.jsx
        ├── api/
        │   └── axios.js
        ├── components/
        │   └── PrivateRoute.jsx
        └── App.jsx
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Neon account (PostgreSQL)
- MongoDB Atlas account
- Groq API key
- Gmail account with App Password enabled

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```
GROQ_API_KEY=your_groq_api_key
POSTGRES_URL=postgresql+asyncpg://user:password@host/support_db
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=60
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

Initialize the database:

```bash
python db/init_db.py
python db/seed.py
```

Seed an executive manually in `db/seed_executive.py` then run:

```bash
python db/seed_executive.py
```

Start the backend:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/customer/register` | Public |
| POST | `/auth/customer/login` | Public |
| POST | `/auth/executive/login` | Public |

### Tickets
| Method | Endpoint | Access |
|---|---|---|
| POST | `/tickets/` | Customer |
| GET | `/tickets/my` | Customer |
| GET | `/tickets/{id}` | Customer |

### Executive
| Method | Endpoint | Access |
|---|---|---|
| GET | `/executive/me` | Executive |
| GET | `/executive/tickets` | Executive |
| GET | `/executive/tickets/{id}` | Executive |
| PATCH | `/executive/tickets/{id}/status` | Executive |

---

## How the Agent Works

1. Customer submits a ticket — FastAPI saves it to MongoDB and triggers the agent in the background
2. Agent retrieves the 3 most semantically similar knowledge base documents using FAISS vector search
3. Ticket + RAG context is sent to Groq LLM with a structured system prompt
4. LLM returns a JSON decision — category, priority, can_resolve, resolution or escalation_reason
5. If resolved — ticket is updated, resolution email sent to customer
6. If escalated — ticket is updated with escalated status, escalation email sent to executive team
7. Every step is logged into the ticket's conversation_history array in MongoDB

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key for LLM inference |
| `POSTGRES_URL` | Neon PostgreSQL connection string |
| `MONGO_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | HS256 |
| `JWT_EXPIRY_MINUTES` | Token expiry in minutes |
| `EMAIL_HOST` | SMTP host (smtp.gmail.com) |
| `EMAIL_PORT` | SMTP port (587) |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASSWORD` | Gmail App Password |
