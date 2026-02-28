Product Requirements Document (PRD)
Product: CircleBet (POC)
Version: v0.1
Deployment: Render
Backend: Python (FastAPI)
Frontend: React + TypeScript (Next.js recommended)
Scope: Private beta / POC

1. Product Overview
1.1 Vision

CircleBet is a private prediction market platform for closed groups (“Circles”) where friends can create and trade bets using virtual currency — behaving exactly like Polymarket, but without real money.

The platform enables:

Private prediction markets

Real-time pricing based on supply/demand

Portfolio tracking

Leaderboards within friend groups

⚠️ No real money, no withdrawals, no crypto — purely social & competitive.

2. Problem Statement

Polymarket-style prediction markets are:

Public

Crypto-based

Legally complex

Intimidating for casual users

Friend groups often want:

Fun competitive forecasting

Political debates, sports predictions, internal dares

Bragging rights

No financial risk

There is no polished, private Polymarket-like experience for casual social groups.

3. Goals & Non-Goals
3.1 Goals (POC)

Users can create private “Circles”

Invite friends via link

Create prediction markets

Trade YES/NO shares

Dynamic price updates

Virtual currency balances

Leaderboard inside circle

Mobile-first UI

Fast and smooth UX

3.2 Non-Goals (POC)

No real money

No crypto wallet integration

No public markets

No compliance framework

No fiat or token withdrawals

No advanced financial derivatives

4. Core Concepts
4.1 Circle

A private group of users.

Properties:

Name

Description

Invite link

Creator (admin)

Member list

Virtual treasury (optional)

4.2 Market

A binary prediction market inside a Circle.

Example:

“Will Team A win the finals?”

Properties:

Title

Description

End date

Status (Open / Closed / Resolved)

Outcome: YES / NO

Current YES price

Current NO price

Total volume

4.3 Shares

Users buy:

YES shares

NO shares

Price updates dynamically based on demand.

4.4 Virtual Currency

Each user starts with:

10,000 CircleCoins (per Circle)

No real-world value.

5. Functional Requirements
5.1 Authentication

Email + password (POC)

Optional: OAuth (Google) later

JWT-based authentication

Session persistence

5.2 Circle Management
Users Can:

Create a Circle

Generate invite link

Join via invite link

Leave circle

Admin Can:

Close markets

Resolve markets

Remove users (optional POC+)

5.3 Market Creation

Users can create:

Binary market

End date required

Optional image

Category tag

Validation:

Must belong to Circle

End date must be future

5.4 Trading Engine (Core Logic)
Behavior must mimic Polymarket:

Options:

Option A (Simpler POC): LMSR (Logarithmic Market Scoring Rule)

Pros:

Easy to implement

Predictable

Always liquid

Price formula:

YES price = exp(q_yes / b) / (exp(q_yes / b) + exp(q_no / b))

Where:

q_yes = total YES shares

q_no = total NO shares

b = liquidity parameter

This is strongly recommended for POC.

Trade Flow

User buys:

X dollars worth of YES

System:

Calculates cost via LMSR

Deducts balance

Updates shares

Recalculates price

Broadcast update

5.5 Portfolio

User can see:

Current balance

Shares per market

Unrealized PnL

Realized PnL

Market performance

5.6 Market Resolution

Admin resolves:

YES or NO

System:

Pays out winning shares at 1.0

Losers become 0

Update balances

Lock market

5.7 Leaderboard

Inside each Circle:

Rank by total balance

Weekly performance (future)

Win rate

6. UX / UI Requirements
6.1 Design Principles

Mobile-first

Polymarket-inspired

Dark mode default

Clean typography

Large touch targets

Fast transitions

Real-time price updates

6.2 Key Screens
1️⃣ Landing Page

What is CircleBet

Create Circle

Join Circle

2️⃣ Circle Dashboard

Shows:

Active markets

Resolved markets

Leaderboard preview

Create Market button

Mobile layout:

Vertical cards

YES/NO buttons visible directly

3️⃣ Market Page

Must include:

Price chart

YES price (green)

NO price (red)

Buy modal

Order summary

Market description

Volume

Time remaining

4️⃣ Trade Modal

User enters:

Amount to spend

Shows:

Shares received

Avg price

New market price

Slippage

Must update in real time.

5️⃣ Portfolio Page

Total balance

PnL

Holdings list

Performance graph

7. Technical Architecture
7.1 Frontend

Recommended: Next.js (App Router)

Why:

SSR support

SEO future-proofing

API route option

Easy deployment to Render

Stack:

React

TypeScript

TailwindCSS

Zustand (state)

React Query (server sync)

Recharts (charts)

7.2 Backend

FastAPI

Responsibilities:

Auth

Circle management

Market engine

Trading logic

Resolution

Leaderboard

WebSockets for live price updates

7.3 Database

PostgreSQL

Tables:

Users

id

email

password_hash

created_at

Circles

id

name

creator_id

CircleMembers

user_id

circle_id

balance

Markets

id

circle_id

title

description

end_date

q_yes

q_no

b

status

outcome

Trades

id

user_id

market_id

side (YES/NO)

amount_spent

shares_received

timestamp

7.4 Realtime Updates

WebSocket:

On trade → broadcast updated price

Market page auto-refresh price

Optimistic UI

8. API Design (Example)

POST /circles
POST /circles/{id}/join
POST /markets
POST /markets/{id}/trade
POST /markets/{id}/resolve
GET /markets/{id}
GET /portfolio
GET /leaderboard

9. MVP Scope Cut

If needed, cut:

Charts

Advanced portfolio analytics

Market categories

User avatars

Notifications

Must keep:

Circles

Markets

Trading engine

Resolution

Leaderboard

10. Success Metrics

POC Metrics:

% of invited users who join

Avg trades per user

Avg markets per circle

Repeat session rate

Time spent in app

11. Risks
1️⃣ Legal

Even without real money, some jurisdictions regulate prediction markets.
Mitigation:

Strong disclaimer

“No real money”

No cash-out

Private groups only

2️⃣ Market Manipulation

Admin insider trading.
Mitigation:

Allow trade lock before resolution

Log audit trail

3️⃣ Low Liquidity

Mitigation:

LMSR ensures liquidity


12. Core Decisions (Locked)
Question	Decision
Currency per circle?	❌ No — one global virtual currency
Liquidity parameter (b)?	✅ Fixed per market (recommended: 100)
Selling shares?	❌ No selling
Auto-close markets?	✅ Yes at end_date
Transaction transparency?	✅ Yes — full visible trade history