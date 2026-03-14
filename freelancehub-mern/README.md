# FreelanceHub — MERN Stack Freelancing Platform

Full end-to-end MERN (MongoDB, Express, React, Node.js) freelancing platform based on the Smart Freelancing Platform documentation.

## Project Structure

```
freelancehub-mern/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── layout/      # Navbar, Sidebar
│       │   ├── common/      # ProtectedRoute, etc.
│       │   ├── gigs/        # GigCard
│       │   └── projects/    # JobCard
│       ├── context/         # AuthContext, ToastContext, SocketContext
│       ├── hooks/           # useFetch, useDebounce, usePagination
│       ├── pages/           # All page components
│       │   ├── dashboard/   # All dashboard sub-pages
│       │   ├── HomePage.js
│       │   ├── AuthPages.js
│       │   ├── GigsPage.js
│       │   └── JobsPage.js
│       └── services/        # API service layer (axios)
└── server/                  # Express backend
    ├── config/              # DB connection
    ├── controllers/         # Business logic (12 controllers)
    ├── middleware/          # Auth, error handling
    ├── models/              # 12 Mongoose models
    ├── routes/              # 13 route files
    ├── services/            # AI matching service
    └── utils/               # Email, notifications
```

## Features Implemented

### Backend (Express + MongoDB)
- JWT Authentication with email verification & password reset
- Role-based access: Freelancer, Employer, Admin
- 12 Mongoose models with full schema validation & indexes
- AI-powered job matching algorithm
- Razorpay escrow payment integration
- Real-time messaging with Socket.io
- Cloudinary file uploads
- Email notifications (Nodemailer)
- Rate limiting & security (Helmet, mongo-sanitize)
- Full CRUD for all entities
- Dispute resolution system
- JSS (Job Success Score) calculation
- Connects currency system

### Frontend (React)
- Complete authentication flow (login, register, verify, forgot/reset password)
- Role-based dashboards with sidebar navigation
- Explore Gigs page with 7 filters + load more
- Browse Jobs page with advanced filters
- Claude AI assistant (real Anthropic API)
- Contracts management with milestone tracking
- Real-time messaging (Socket.io client)
- Earnings dashboard with Razorpay withdrawal flow
- My Gigs management with 3-tier packages
- Proposals tracking
- Talent search for employers
- Post Job form
- Profile editor with completeness score
- Toast notifications
- Protected routes

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your credentials
```

### 3. Run in development
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables (server/.env)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `SMTP_HOST/EMAIL/PASSWORD` | Email SMTP settings |
| `ANTHROPIC_API_KEY` | Claude AI API key |
| `CLOUDINARY_*` | Cloudinary credentials |
| `CLIENT_URL` | Frontend URL |

## API Endpoints

| Module | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Users/Profiles | `/api/users` |
| Projects/Jobs | `/api/projects` |
| Gigs | `/api/gigs` |
| Applications | `/api/applications` |
| Contracts | `/api/contracts` |
| Payments | `/api/payments` |
| Messages | `/api/messages` |
| Reviews | `/api/reviews` |
| Notifications | `/api/notifications` |
| Admin | `/api/admin` |
| Claude AI | `/api/ai` |

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Socket.io-client
- **Backend**: Node.js, Express 4, Socket.io
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + bcryptjs
- **Payments**: Razorpay (escrow)
- **AI**: Anthropic Claude API (claude-sonnet-4-5)
- **Email**: Nodemailer
- **Storage**: Cloudinary
- **Security**: Helmet, express-mongo-sanitize, express-rate-limit
