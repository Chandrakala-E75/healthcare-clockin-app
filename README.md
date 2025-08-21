# Healthcare Clock-in System

A web application for healthcare workers to clock in and clock out of their shifts with location-based validation and manager dashboard analytics.

## Live Demo
[Live Application URL](https://healthcare-clockin-app-n3o1.vercel.app)

## Features Implemented

### Manager Features
- **Location Management**: Set workplace location and perimeter (2km radius) for clock-in validation
- **Staff Dashboard**: View all currently clocked-in staff in real-time
- **Analytics**: Average hours per day, daily check-in counts, weekly hours summary
- **History Tracking**: Complete table of staff clock-in/out records with timestamps and locations

### Care Worker Features
- **Location-Based Clock In/Out**: GPS validation within workplace perimeter
- **Shift Notes**: Optional notes when clocking in and out
- **Personal History**: View complete shift history and total hours worked
- **Real-time Validation**: Clear feedback when outside allowed perimeter

### Authentication
- **Auth0 Integration**: Secure login with email and Google OAuth
- **Role-Based Access**: Different interfaces for managers vs care workers
- **User Registration**: Complete signup and session management
- **Flexible Role System**: New users default to care worker with ability to switch to manager role for demo/testing purposes

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Ant Design, React Context
- **Backend**: GraphQL with GraphQL Yoga, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: Auth0
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- Auth0 account
- PostgreSQL database (for production)

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/Chandrakala-E75/healthcare-clockin-app.git
cd healthcare-clockin
npm install
```

2. Create `.env.local` file:
```bash
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
DATABASE_URL="file:./dev.db"  # For development (SQLite)
# DATABASE_URL="postgresql://user:password@host:port/database"  # For production (PostgreSQL)
```

3. Setup database and run:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

4. Open http://localhost:3000

## Project Structure
```
src/
├── app/                  # Next.js pages (dashboard, clock, history)
├── components/           # React components
│   ├── careworker/      # Clock-in interface
│   ├── manager/         # Dashboard components
│   └── layout/          # Shared layout
├── graphql/             # GraphQL operations
├── lib/                 # Apollo Client, Prisma setup
└── pages/api/           # GraphQL API endpoint
```

## Auth0 Configuration

1. Create Auth0 application
2. Set callback URL: `http://localhost:3000/api/auth/callback`
3. Set logout URL: `http://localhost:3000`
4. Enable Google social connection
5. Add credentials to `.env.local`

## Usage

- **New User Flow**: All new users start as care workers after registration
- **Role Switching**: Users can switch between care worker and manager roles using the toggle in the navigation
- **Manager Features**: Access dashboard, analytics, and location management when in manager mode
- **Care Worker Features**: Clock in/out interface and personal history when in care worker mode
- **Testing**: Role switching allows easy testing of all features with a single account

## Database Schema

- **User**: Authentication and roles
- **WorkplaceSettings**: Location perimeter configuration  
- **ClockRecord**: Clock-in/out records with location data

## Design Decisions

### Role Management
Since the requirements didn't specify user role assignment, we implemented a flexible system where users can switch between roles. This design choice:
- Simplifies testing and demonstration of all features
- Allows reviewers to easily access both manager and care worker interfaces
- Provides a practical solution for organizations where staff may have multiple responsibilities
- Can be easily modified to implement fixed role assignment if needed in production

### Database Migration
The application was initially built with SQLite for development and later migrated to PostgreSQL for production deployment, ensuring better scalability and performance.

### GraphQL Implementation
Migrated from Apollo Server Micro to GraphQL Yoga for better Next.js 14 compatibility and improved performance.

## Deployment

Optimized for Vercel deployment. For production:
1. Update environment variables with Auth0 production credentials
2. Set `DATABASE_URL` to your PostgreSQL connection string
3. Database migrations run automatically during build process

## Built for Healthcare Workforce Management

This application provides a complete solution for healthcare organizations to manage staff attendance with location-based validation, comprehensive analytics, and user-friendly interfaces for both managers and care workers.