# 🏭 Manufacturing Company BDA CRM System

A production-quality full-stack MERN application for Business Development Associates (BDA) to manage leads, track sales pipelines, schedule follow-ups, monitor conversions, and analyze team performance.

Built with a modern SaaS-style dashboard UI inspired by HubSpot, Zoho CRM, and Pipedrive.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Shadcn UI |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT + bcrypt |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **State Management** | Redux Toolkit |
| **Forms** | React Hook Form + Zod |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure password hashing
- Role-based access control (Admin, Manager, BDA)
- Protected routes and API middleware
- Persistent login with token refresh

### 📊 Dashboard
- Real-time analytics with interactive charts
- Revenue trends, conversion rates, lead source analytics
- Team performance leaderboard
- Recent activities feed & upcoming follow-ups
- Beautiful stat cards with trend indicators

### 👥 Lead Management
- Full CRUD operations for leads
- Advanced search, filtering, and sorting
- Pagination and CSV export
- Lead notes/comments system
- Activity timeline per lead

### 📋 Kanban Sales Pipeline
- Drag-and-drop board (New → Contacted → Qualified → Negotiation → Won → Lost)
- Real-time status updates on drag
- Lead detail modals
- Smooth animations

### ✅ Task & Follow-up Management
- Create, assign, and track tasks
- Priority levels and due dates
- Task completion tracking
- Follow-up reminders

### 📈 Team Performance
- Per-employee performance metrics
- Conversion rate comparisons
- Monthly trend analysis
- Activity heatmaps
- BDA leaderboards

### 🎨 UI/UX
- Modern SaaS dashboard design
- Dark mode support
- Fully responsive (mobile, tablet, desktop)
- Glassmorphism effects
- Skeleton loading states
- Toast notifications
- Framer Motion animations

---

## 📁 Project Structure

```
manufacturing-crm/
├── client/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Login, Signup
│   │   │   └── (dashboard)/    # Protected dashboard pages
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   ├── dashboard/      # Dashboard widgets
│   │   │   ├── leads/          # Lead management
│   │   │   ├── pipeline/       # Kanban board
│   │   │   ├── tasks/          # Task management
│   │   │   ├── team/           # Team analytics
│   │   │   └── shared/         # Shared components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities (axios, utils)
│   │   ├── services/           # API service layer
│   │   ├── store/              # Redux Toolkit store
│   │   └── types/              # TypeScript interfaces
│   └── package.json
│
├── server/                     # Express.js Backend
│   ├── config/                 # DB & app config
│   ├── controllers/            # Route controllers
│   ├── middleware/              # Auth, validation, error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── seed/                   # Demo data seeder
│   ├── utils/                  # Helpers & utilities
│   ├── server.js               # Entry point
│   └── package.json
│
├── .env.example                # Environment variables template
└── README.md                   # This file
```

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** >= 18.x
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd manufacturing-crm
```

### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Create environment file
cp ../.env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database with demo data
npm run seed

# Start the development server
npm run dev
```

The server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

---

## 🔑 Demo Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@mfgcrm.com | admin123 |
| **Manager** | rajesh.kumar@mfgcrm.com | password123 |
| **Manager** | priya.sharma@mfgcrm.com | password123 |
| **BDA** | amit.patel@mfgcrm.com | password123 |
| **BDA** | sneha.reddy@mfgcrm.com | password123 |
| **BDA** | vikram.singh@mfgcrm.com | password123 |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Leads
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List leads (paginated, filterable) |
| GET | `/api/leads/:id` | Get single lead |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| PATCH | `/api/leads/:id/status` | Update lead status |
| POST | `/api/leads/:id/notes` | Add note to lead |
| GET | `/api/leads/export/csv` | Export leads CSV |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/complete` | Complete task |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/team` | Team performance |
| GET | `/api/analytics/leaderboard` | BDA leaderboard |
| GET | `/api/analytics/trends` | Monthly trends |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

---

## 🚢 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the root directory to `client`
4. Add environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>/api`
5. Deploy

### Backend (Render / Railway)
1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app)
3. Set the root directory to `server`
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables from `.env.example`
7. Deploy

### Database (MongoDB Atlas)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Get the connection string
4. Update `MONGODB_URI` in your backend environment

---

## 📄 License

This project is built for educational and assessment purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Recharts](https://recharts.org/) - Charts
- [dnd-kit](https://dndkit.com/) - Drag and drop
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations
