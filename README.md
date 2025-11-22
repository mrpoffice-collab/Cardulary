# Cardulary

**Your Event Address Collection Assistant**

Cardulary is a mobile-first web application that streamlines the process of collecting mailing addresses from event guests. Perfect for weddings, graduations, parties, and holiday cards.

## Features

- **Event Management**: Create and manage unlimited events
- **AI-Powered Messaging**: Generate personalized address requests using Claude AI
- **Multi-Channel Delivery**: Send requests via email (Resend) or SMS (Twilio)
- **Automated Reminders**: Smart follow-ups for guests who haven't responded
- **Contact Database**: Permanent storage of addresses for future events
- **Easy Export**: Export to CSV, Excel, PDF, or directly to Minted/Shutterfly
- **Mobile-Optimized**: Frictionless guest submission forms with address autocomplete

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js (email/password + Google OAuth)
- **AI**: Claude API (Sonnet 4.5) + OpenAI GPT-4o mini
- **Email**: Resend.com
- **SMS**: Twilio
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Neon PostgreSQL database
- API keys for required services

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cardulary
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys and database URL.

4. Push the database schema:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Required environment variables:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth sessions
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional)
- `ANTHROPIC_API_KEY`: Claude API key
- `OPENAI_API_KEY`: OpenAI API key
- `RESEND_API_KEY`: Resend email API key
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `GOOGLE_PLACES_API_KEY`: Google Places API key
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token

## Project Structure

```
cardulary/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── submit/[token]/    # Public guest submission
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── db/                # Database schema and client
│   ├── ai/                # AI utilities (upcoming)
│   ├── email/             # Email templates (upcoming)
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## Database Schema

The app uses the following main tables:

- `users`: User accounts
- `events`: Event information
- `contacts`: Master contact database
- `event_guests`: Event-specific guest instances
- `address_submissions`: Guest address submissions
- `message_templates`: Custom message templates
- `reminder_schedules`: Automated reminder configurations
- `delivery_events`: Email/SMS delivery tracking
- `exports`: Export history

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: TypeScript type checking
- `npm run db:push`: Push database schema changes
- `npm run db:studio`: Open Drizzle Studio

### Type Checking

This project uses TypeScript with strict mode enabled. Run type checking:

```bash
npm run type-check
```

## Deployment

The app is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## MVP Features (Current Build Status)

### ✅ Completed (11/12 Core Features - 92%)

#### Authentication & User Management
- ✅ NextAuth.js authentication (email/password + Google OAuth)
- ✅ User registration and login
- ✅ Protected routes and session management

#### Event Management
- ✅ Event creation with customization
- ✅ Event types (Wedding, Graduation, Birthday, Reunion, Holiday Cards)
- ✅ Event dashboard with statistics
- ✅ Real-time response tracking

#### Guest Management
- ✅ Manual guest addition
- ✅ Guest list table with status indicators
- ✅ Unique token generation per guest
- ✅ Status tracking (Not Sent, Pending, Completed, Bounced)

#### AI-Powered Messaging
- ✅ Claude API integration for message personalization
- ✅ 3 tone options (Warm & Casual, Polite & Formal, Playful)
- ✅ Context-aware message generation
- ✅ Live preview and editing

#### Multi-Channel Communication
- ✅ Email sending via Resend.com
- ✅ SMS sending via Twilio
- ✅ Beautiful HTML email templates
- ✅ Delivery event tracking

#### Guest Submission
- ✅ Token-based public submission pages
- ✅ Mobile-optimized address forms
- ✅ US state dropdown with validation
- ✅ Edit capability (24-hour window)
- ✅ Success confirmation page

#### Export Functionality
- ✅ CSV export (generic format)
- ✅ Excel export (.xlsx)
- ✅ Minted format export
- ✅ Shutterfly format export
- ✅ Vistaprint format export
- ✅ Avery Labels export (sorted by ZIP)
- ✅ Flexible filtering (by status)

#### UI/UX
- ✅ Landing page with feature showcase
- ✅ Responsive dashboard layout
- ✅ Modal dialogs for forms
- ✅ Loading states and error handling
- ✅ Status badges and indicators

### 🚧 Remaining (1 Feature)
- ⏳ Automated reminder system with cron jobs

## License

Copyright © 2025 Cardulary. All rights reserved.

## Support

For issues and questions, please contact support@cardulary.app
