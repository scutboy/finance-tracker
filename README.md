# Finance Tracker (LKR)

A full-stack personal finance tracker built with FastAPI and React (Vite).
Tracks Debts, Savings Goals, and Budgets with "Rs" localized formatting targeted for Sri Lanka.

## Tech Stack
- **Backend:** FastAPI, SQLite (Dev ready for Postgres in Prod), SQLAlchemy ORM, JWT (Auth) via `python-jose`.
- **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query, Recharts, Lucide Icons, Axios.

## Setup Instructions

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Run database migrations
alembic upgrade head

# Generate dummy seed data
python seed.py

# Launch API server
uvicorn app.main:app --reload
```

The server will be live on `http://localhost:8000` hosting standard swagger docs at `/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The client application will run on `http://localhost:5173`. 
Use **Email**: `test@test.com` and **Password**: `test1234` to login to the seeded demo account natively capturing all goals and tracked parameters.
