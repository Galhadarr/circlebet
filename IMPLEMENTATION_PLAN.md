Phase 1 – Backend Foundation
1. Setup Project

Create FastAPI app

Configure:

PostgreSQL

SQLAlchemy

Alembic

JWT auth

Dockerize for Render

Deliverable:

Running backend with health endpoint

2. Authentication

Implement:

POST /auth/register
POST /auth/login

Use:

bcrypt for hashing

JWT tokens

Add dependency:

get_current_user()

Deliverable:

User registration and login working

Phase 2 – Circle System
3. Circles API

Implement:

POST /circles
GET /circles
POST /circles/join/{invite_token}
GET /circles/{id}

Generate:

UUID invite token

Deliverable:

User can create and join circles

Phase 3 – Market System
4. Market Creation

POST /markets

Validation:

user must belong to circle

end_date > now

Initialize:

q_yes = 0

q_no = 0

b = 100

5. Auto-Close Job

Implement background scheduler:

Every minute:

Find markets with end_date < now AND status OPEN

Set status CLOSED

Phase 4 – LMSR Engine

Create isolated module:

services/lmsr.py

Functions:

cost(q_yes, q_no, b)

price_yes(q_yes, q_no, b)

buy_yes(q_yes, q_no, b, amount_spent)

buy_no(q_yes, q_no, b, amount_spent)

Important:

Use high-precision floats (Decimal)

Deliverable:

Unit-tested LMSR logic

Phase 5 – Trading Endpoint

POST /markets/{id}/trade

Input:

side (YES/NO)

amount_spent

Process:

Lock market row

Validate:

market OPEN

user in circle

sufficient balance

Compute:

cost delta

shares_received

Update:

q_yes or q_no

user balance

holdings

trades table

Return:

new price

shares_received

Deliverable:

Fully functional trading

Phase 6 – Resolution

POST /markets/{id}/resolve

Admin only.

Process:

Ensure CLOSED

Set outcome

For each holding:

If winner → payout shares

Update balances

Mark RESOLVED

Phase 7 – Leaderboard

GET /circles/{id}/leaderboard

Sort:

balance descending

Phase 8 – WebSockets

Create:

/ws/markets/{id}

On trade:

Broadcast:

price_yes

price_no

volume

Frontend subscribes for live updates.

Phase 9 – Frontend Implementation
1. Setup Next.js

Tailwind

Dark theme

Layout system

2. Pages

/login

/dashboard

/circle/[id]

/market/[id]

/portfolio

/leaderboard

3. Trade Modal

Amount input

Show:

shares received

price impact

new price

Must call preview endpoint before confirm.

Phase 10 – Deployment

Deploy:

Backend to Render

PostgreSQL to Render

Frontend to Render static site

Configure:

CORS

ENV variables

WebSocket support

Phase 11 – Testing

Must include:

Unit tests for LMSR

Trade precision test

Concurrent trade simulation

Market resolution payout test