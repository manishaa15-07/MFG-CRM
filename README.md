# Manufacturing Sales CRM

A robust, full-stack Customer Relationship Management (CRM) application tailored specifically for Business Development Associates (BDAs) in the manufacturing industry.

## Overview

This application helps BDAs manage manufacturing prospects, track the sales pipeline, manage follow-up tasks, and monitor their performance. It provides a modern, responsive UI built with Next.js and a scalable Express backend connected to MongoDB.

## Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (backed by Base UI)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **Framework:** [Express.js](https://expressjs.com/) (Node.js)
- **Database:** [MongoDB](https://www.mongodb.com/) via Mongoose
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **Environment Management:** dotenv

## Features

- **Authentication & Authorization:** Secure JWT-based login, signup, and protected routes.
- **Dashboard Overview:** Key metrics like Active Leads, Won Deals, and monthly conversion trends.
- **Lead Management:** Create, view, update, and track prospects with industry-specific fields (e.g., expected revenue, lead status, priority).
- **Task & Follow-Up System:** Dedicated module to schedule tasks and tie them to specific leads to ensure no follow-up is missed.
- **Kanban Pipeline:** Visual drag-and-drop or categorized pipeline to move leads through the sales cycle.
- **Team Insights:** Track performance and compare conversion rates across your BDA team.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
manufacturing-crm/
├── client/                 # Next.js Frontend
│   ├── public/             # Static assets
│   └── src/
│       ├── app/            # Next.js App Router (pages & layouts)
│       ├── components/     # Reusable UI & shared components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities & Axios configuration
│       ├── store/          # Redux slices and store configuration
│       └── types/          # TypeScript interfaces
└── server/                 # Express Backend
    ├── controllers/        # Route controllers
    ├── middleware/         # Auth & error handling
    ├── models/             # Mongoose schemas
    ├── routes/             # API route definitions
    └── utils/              # Helper functions
```

## Future Enhancements
- Export reports to CSV/PDF
- Email integrations and notifications
- Advanced analytics filtering
