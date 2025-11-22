# Product Requirements Document: Cardulary

**Version**: 1.0
**Date**: November 22, 2025
**Status**: Draft for Development
**Author**: Product Strategy Analysis

---

## 1. Executive Summary

### Product Name
**Cardulary** - Your Event Address Collection Assistant

### Description
Cardulary is a mobile-first web application that solves the persistent problem of collecting mailing addresses from event guests. Whether planning a wedding, graduation party, or family reunion, Cardulary enables organizers to send personalized address requests via email or SMS, collect responses through a frictionless web form, and export contact data directly to greeting card and invitation mailing services.

### Target Audience
**Primary**: Event organizers (ages 25-55) planning life milestone events
- Wedding couples and their families
- Graduation party hosts
- Reunion organizers
- Annual holiday card senders

**Secondary**: Frequent entertainers and professional event planners

### Core Value Proposition
Transform the chaotic, spreadsheet-based process of collecting guest addresses into a streamlined, AI-assisted workflow that takes minutes instead of hours. Cardulary eliminates follow-up fatigue by automatically tracking responses, sending smart reminders, and maintaining a permanent contact database for future events.

**Key Differentiator**: Unlike generic contact management apps, Cardulary is purpose-built for event address collection with direct integrations to mailing services and AI-powered personalization that feels human, not robotic.

---

## 2. Problem Statement

### The Problem
Event organizers face a frustrating multi-week process of collecting mailing addresses from guests:

1. **Scattered Contact Information**: Friends and family are spread across email, social media, and phone contacts with outdated or missing address data
2. **Manual Outreach Burden**: Sending individual texts/emails asking for addresses is time-consuming and feels impersonal
3. **Follow-up Fatigue**: Tracking who has and hasn't responded requires spreadsheets and constant mental load
4. **Data Entry Hell**: Manually typing responses into Excel or mailing service platforms introduces errors
5. **One-Time Use Syndrome**: After the event, all this effort is lost and must be repeated for the next occasion

### Current Alternatives

| Solution | Limitations |
|----------|-------------|
| **Google Forms/SurveyMonkey** | Generic forms not designed for address collection; no reminder automation; requires manual export/formatting; no persistent contact database |
| **Spreadsheet + Manual Texting** | Labor-intensive; high error rate; no tracking; guests hate typing addresses into text messages |
| **Event Planning Platforms (Zola, Joy, The Knot)** | Locked into their ecosystem; wedding-specific; expensive; bloated with features users don't need |
| **Contact Management Apps (Contacts, Google Contacts)** | Not designed for outbound collection; no request functionality; no event-specific organization |

### Why Now?
- 50% of U.S. wedding invitations are still physical mail (2024 data)
- Holiday card sending has rebounded post-pandemic (+23% growth 2021-2024)
- Privacy concerns make people reluctant to share addresses on social media
- Mobile-first workflows are now expected, not optional

---

## 3. Features & Requirements

### MVP Features (V1.0) - MUST HAVE

#### 3.1 User Account Management
**User Story**: As an event organizer, I need to create an account so I can securely store my contact data and manage multiple events over time.

**Requirements**:
- Email/password registration with email verification
- OAuth login (Google, Apple Sign-In)
- Password reset functionality
- Profile settings: name, email, phone number, timezone
- Account deletion with data export option (GDPR compliance)

**Technical Notes**:
- Use Neon PostgreSQL for user data storage
- Implement Row Level Security (RLS) for multi-tenancy
- JWT-based authentication with refresh tokens

---

#### 3.2 Event Creation & Management
**User Story**: As an organizer, I need to create an event and define what information I'm collecting so I can tailor requests to my specific needs.

**Requirements**:
- Create unlimited events (linked to user account)
- Event metadata:
  - Event name (e.g., "Sarah & Mike's Wedding")
  - Event type (dropdown: Wedding, Graduation, Birthday, Reunion, Holiday Cards, Other)
  - Event date (optional)
  - Custom message/instructions for guests
- Toggle data fields to collect:
  - Mailing address (always required)
  - Nickname/preferred name
  - Gift received (free text or checkbox)
  - RSVP status (Yes/No/Maybe)
  - Custom fields (up to 5 additional fields with user-defined labels)
- Event dashboard showing:
  - Total guests invited
  - Response rate (%)
  - Last activity timestamp
  - Quick action buttons (Send Reminders, Export Data)

**Technical Notes**:
- Flexible JSONB schema for custom fields in PostgreSQL
- Event-level permissions (owner only for MVP, future: shared access)

---

#### 3.3 Contact Import & Guest List Management
**User Story**: As an organizer, I need to quickly add guests from my existing contacts so I don't have to manually type everyone's name and contact info.

**Requirements**:
- Manual guest addition (one at a time):
  - First name (required)
  - Last name (required)
  - Email OR phone number (at least one required)
  - Optional: existing address, notes
- Bulk import via CSV upload:
  - Template download with required column headers
  - Field mapping interface (match CSV columns to Cardulary fields)
  - Duplicate detection with merge/skip options
  - Import validation with error reporting
- Guest list table view:
  - Sortable columns: Name, Contact Method, Status, Last Updated
  - Inline editing for quick corrections
  - Bulk actions: Delete, Send Request, Export Selected
  - Search/filter by response status
- Guest status indicators:
  - "Not Sent" (gray) - Request hasn't been sent yet
  - "Pending" (yellow) - Request sent, waiting for response
  - "Completed" (green) - Address received
  - "Bounced" (red) - Delivery failed

**Technical Notes**:
- CSV parsing with Papa Parse library
- Debounced search for large guest lists (1000+ contacts)
- Batch operations for performance (send in chunks of 50)

---

#### 3.4 AI-Powered Address Request Generation
**User Story**: As an organizer, I want personalized message templates so my requests feel warm and human, not automated spam.

**Requirements**:
- Smart message composer with three modes:
  1. **Quick Send**: Default template with minimal customization
  2. **AI Personalize**: Claude analyzes event type and guest relationship to generate custom message
  3. **Custom Write**: Full manual control with merge fields
- Merge fields available:
  - `{firstName}` - Guest's first name
  - `{eventName}` - Event name
  - `{organizerName}` - Your name
  - `{eventDate}` - Event date (if provided)
- AI personalization inputs:
  - Guest relationship (dropdown: Family, Close Friend, Colleague, Acquaintance)
  - Tone preference (dropdown: Warm & Casual, Polite & Formal, Playful)
  - Additional context (optional text: "We haven't talked in 5 years, last saw at college reunion")
- Live preview before sending
- Save custom templates for reuse
- Character count (SMS mode shows segment count)

**Example AI Output**:
```
Input: Wedding event, Close Friend relationship, Warm & Casual tone
Output: "Hey Sarah! Mike and I are getting married this June and we'd love to send you an invitation. Could you share your current mailing address? It'll take 30 seconds: [link]. Can't wait to celebrate with you!"
```

**Technical Notes**:
- Claude API for message generation (Sonnet 4.5)
- Prompt engineering to maintain consistent quality and brevity
- Fallback to template if API fails
- Cache common templates to reduce API calls

---

#### 3.5 Multi-Channel Request Delivery
**User Story**: As an organizer, I need to send address requests via email or text depending on what contact info I have for each guest.

**Requirements**:
- Send individual requests (one-off)
- Bulk send to selected guests or all "Not Sent" guests
- Email delivery:
  - From address: noreply@cardulary.app (with custom reply-to)
  - Subject line: Customizable (default: "{organizerName} needs your mailing address")
  - HTML email template with branded design
  - Unique tracking link embedded
  - Unsubscribe link (required for compliance)
- SMS delivery:
  - Shortened tracking link (bit.ly style)
  - Character optimization for single SMS segment
  - Delivery status webhooks (delivered, failed, clicked)
- Sending controls:
  - Preview before sending (shows actual message with merge fields populated)
  - Schedule send (date/time picker with timezone handling)
  - Throttling for bulk sends (prevent spam filters)
- Delivery tracking:
  - Email: Opened (pixel tracking), Clicked link, Bounced
  - SMS: Delivered, Failed, Clicked link
  - Real-time status updates in guest list

**Technical Notes**:
- Resend.com for transactional email (5,000 free emails/month)
- Twilio for SMS ($0.0079/SMS, budget $100/month for MVP)
- Link shortener: Custom domain with tracking middleware
- Queue system for bulk sends (Vercel background functions or Inngest)

---

#### 3.6 Frictionless Guest Address Submission
**User Story**: As a guest, I want to submit my address in under 60 seconds without creating an account or navigating a complex form.

**Requirements**:
- Public submission page accessible via unique token URL
- No login/registration required for guests
- Responsive form optimized for mobile (80% of traffic expected)
- Form fields (dynamic based on event settings):
  - Street address (line 1, line 2)
  - City
  - State/Province (dropdown for US/Canada, text for international)
  - ZIP/Postal code
  - Country (dropdown, defaults to US)
  - Optional fields as configured by organizer (nickname, RSVP, etc.)
- Address autocomplete powered by Google Places API
- Smart validation:
  - AI-powered address verification (detect missing apartment numbers, typos)
  - "Did you mean...?" suggestions for common errors
  - International format support
- Immediate confirmation:
  - Thank you message (customizable by organizer)
  - Option to edit submission (time-limited: 24 hours)
- Privacy assurance:
  - Clear statement of data use ("Your address will only be used for [Event Name]")
  - No spam promise

**Technical Notes**:
- Generate unique UUID token per guest per event
- Token expiration: 90 days after event date (or never if no date)
- Rate limiting: 5 submissions per IP per hour (prevent abuse)
- Google Places API: Autocomplete + Geocoding ($2.83 per 1000 requests, budget $50/month)
- AI validation: ChatGPT-4o mini for cost efficiency ($0.15/1M tokens)

---

#### 3.7 Automated Smart Reminders
**User Story**: As an organizer, I want automatic follow-ups for guests who haven't responded so I don't have to manually track and nag people.

**Requirements**:
- Configurable reminder schedule:
  - Default: 3 days, 7 days, 14 days after initial send
  - Custom intervals (user can add/remove reminder points)
  - Disable reminders for specific guests
- AI-powered reminder message variation:
  - Each reminder uses different wording to avoid sounding repetitive
  - Escalating urgency based on event date proximity
  - Maintains same tone as original request
- Reminder rules:
  - Only send to guests with "Pending" status
  - Stop sending if guest submits address
  - Stop sending after event date passes
  - User can cancel all pending reminders
- Reminder preview and editing before schedule activation

**Example Reminder Progression**:
```
Day 0: "Hey Sarah! Could you share your address for our wedding invite? [link]"
Day 3: "Hi Sarah! Just wanted to gently follow up - we need your mailing address to send your invitation. Quick 30-second form: [link]"
Day 7: "Sarah - still need your address! We're finalizing invitations this week. Help us out? [link]"
```

**Technical Notes**:
- Cron job or scheduled Vercel function (check hourly for due reminders)
- Store reminder state in PostgreSQL (event_reminders table)
- Use Claude API for message variation
- Jitter: Randomize send time within 2-hour window to avoid bulk appearance

---

#### 3.8 Contact Database & Organization
**User Story**: As a user, I need a permanent contact database that persists across events so I don't lose addresses after each occasion.

**Requirements**:
- Master contact list (separate from event-specific guests):
  - All unique contacts across all events
  - Merged duplicates (smart detection by email/phone)
  - Full contact card view: Name, email, phone, address, tags, notes, event history
- Contact grouping:
  - Tags/labels (Family, College Friends, Work, etc.)
  - Create custom groups for quick event list building
- Event reuse workflow:
  - "Copy guests from previous event" button
  - Select which guests to import (checkbox selection)
  - Inherited data carries over (address pre-filled if previously submitted)
- Contact search:
  - Full-text search across all fields
  - Filter by tag, event, response status
  - Saved searches for frequent queries

**Technical Notes**:
- Normalization strategy: `contacts` table (master) + `event_guests` table (event-specific instances)
- Foreign key relationships with cascade rules
- Fuzzy matching for duplicate detection (Levenshtein distance on names + exact email/phone match)

---

#### 3.9 Export & Integration
**User Story**: As an organizer, I need to export my collected addresses in formats that work with mailing services and other tools.

**Requirements**:
- Export formats:
  - CSV (standard format with all collected fields)
  - Excel (.xlsx) with formatted columns
  - Print-friendly PDF (sorted by ZIP code for bulk mailing discounts)
- Pre-built integrations (export with service-specific formatting):
  - **Minted** (greeting cards/invitations): Their CSV import format
  - **Shutterfly**: Address book XML format
  - **Vistaprint**: CSV with specific column names
  - **Avery Labels**: Template-ready format with barcode data
  - **Generic Mail Merge**: Format for Word/Google Docs mail merge
- Export filters:
  - Export only "Completed" responses
  - Export selected guests (checkbox selection)
  - Export by tag/group
  - Date range filter (addresses collected between X and Y)
- Export options:
  - Include/exclude specific fields (checkbox toggles)
  - Sort order (Last Name, ZIP Code, Custom)
  - Deduplication (skip duplicate addresses)

**Technical Notes**:
- Server-side export generation to handle large datasets (1000+ contacts)
- Streaming for large files to prevent memory issues
- Pre-signed S3 URLs for download (expire after 24 hours)
- Track export events for analytics

---

#### 3.10 Data Import from External Sources
**User Story**: As a user, I want to import my existing contact data from other platforms so I can consolidate everything in Cardulary.

**Requirements**:
- Import sources:
  - CSV file upload (with field mapping interface)
  - Google Contacts (OAuth integration)
  - Apple Contacts (vCard/VCF import)
  - Outlook/Exchange (CSV export → import)
- Import wizard:
  1. Select source/upload file
  2. Map fields (drag-and-drop or dropdown matching)
  3. Preview first 10 records
  4. Handle conflicts (keep existing, overwrite, create duplicate)
  5. Import with progress bar
  6. Summary report (X imported, Y skipped, Z errors)
- Validation during import:
  - Required fields check (name + email/phone)
  - Format validation (email regex, phone normalization)
  - Error logging with line numbers

**Technical Notes**:
- Background job for large imports (1000+ records)
- Google People API for Contacts integration
- VCard parser for Apple Contacts
- Store import history (rollback capability for 7 days)

---

### V2 Features (Future Roadmap) - NICE TO HAVE

#### 3.11 Collaboration & Sharing (V2.1)
- Share event management with co-organizers (role-based permissions)
- Activity log (who sent requests, who made edits)
- Comments/notes on individual guests

#### 3.12 Analytics & Insights (V2.2)
- Response rate benchmarks (compare to similar events)
- Best time to send analysis (maximize open rates)
- Geographic heatmap of guest locations
- Engagement metrics dashboard

#### 3.13 Payment & Registry Integration (V2.3)
- Gift tracking with dollar amounts
- Thank you card reminder workflow
- Link to wedding registries or gift preference collection

#### 3.14 Advanced AI Features (V2.4)
- AI guest grouping (detect friend clusters from social context)
- Predictive response likelihood (who will need more reminders)
- Smart guest list suggestions ("You invited Sarah, should I add Mike?")
- Automated thank you note drafting

#### 3.15 White-Label Option (V2.5)
- Custom branding for event planners
- Subdomain per planner (planner.cardulary.app)
- B2B pricing tier

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 14 (App Router) + React 18 | Server components for performance; built-in API routes; excellent Vercel deployment |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI development; accessible components; consistent design system |
| **State Management** | React Server Components + Zustand (client state) | Minimize client-side state; Zustand for UI state (modals, filters) |
| **Database** | Neon PostgreSQL (serverless) | Generous free tier (500 MB); auto-scaling; branching for dev/staging |
| **ORM** | Drizzle ORM | Type-safe; excellent DX; serverless-optimized; lighter than Prisma |
| **Authentication** | Clerk or NextAuth.js | Clerk: Easier setup, better UI. NextAuth: Open-source, more control |
| **File Storage** | Vercel Blob Storage | Integrated with Vercel; simple API; pay-as-you-go |
| **Email** | Resend.com | Developer-friendly API; generous free tier; great deliverability |
| **SMS** | Twilio | Industry standard; reliable webhooks; global coverage |
| **AI - Primary** | Claude API (Sonnet 4.5) | Superior message personalization; nuanced tone matching |
| **AI - Secondary** | OpenAI GPT-4o mini | Cost-effective for address validation; fast inference |
| **Background Jobs** | Vercel Cron + Inngest (optional) | Vercel Cron for simple schedules; Inngest for complex workflows |
| **Analytics** | Vercel Analytics + PostHog | Privacy-friendly; self-hosted option; feature flags |
| **Error Tracking** | Sentry | Excellent Next.js integration; source map support |
| **Deployment** | Vercel | Zero-config Next.js deployment; edge functions; preview URLs |

---

### 4.2 Database Schema Overview

#### Core Tables

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Events table
events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT, -- wedding, graduation, birthday, etc.
  event_date DATE,
  custom_message TEXT,
  active_fields JSONB, -- {nickname: true, rsvp: true, custom_fields: [...]}
  created_at TIMESTAMP DEFAULT NOW()
)

-- Master contacts table
contacts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  tags TEXT[], -- ['family', 'college friends']
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT contact_has_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
)

-- Event-specific guest instances
event_guests (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL, -- Denormalized for performance
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  token TEXT UNIQUE NOT NULL, -- Unique submission link token
  status TEXT DEFAULT 'not_sent', -- not_sent, pending, completed, bounced
  request_sent_at TIMESTAMP,
  request_method TEXT, -- email, sms
  submitted_at TIMESTAMP,
  last_reminder_sent_at TIMESTAMP,
  reminder_count INTEGER DEFAULT 0,
  custom_data JSONB, -- {nickname: "Mike", rsvp: "yes", custom_field_1: "..."}
  created_at TIMESTAMP DEFAULT NOW()
)

-- Address submissions (separate table for edit history)
address_submissions (
  id UUID PRIMARY KEY,
  event_guest_id UUID REFERENCES event_guests(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  custom_fields JSONB,
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT, -- For abuse prevention
  is_current BOOLEAN DEFAULT TRUE -- Track edit history
)

-- Message templates
message_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_text TEXT NOT NULL,
  template_type TEXT, -- initial, reminder
  tone TEXT, -- warm_casual, polite_formal, playful
  created_at TIMESTAMP DEFAULT NOW()
)

-- Reminder schedules
reminder_schedules (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  intervals INTEGER[], -- [3, 7, 14] days after initial send
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Delivery tracking
delivery_events (
  id UUID PRIMARY KEY,
  event_guest_id UUID REFERENCES event_guests(id) ON DELETE CASCADE,
  event_type TEXT, -- sent, delivered, opened, clicked, bounced, failed
  channel TEXT, -- email, sms
  metadata JSONB, -- Provider-specific data
  occurred_at TIMESTAMP DEFAULT NOW()
)

-- Export history
exports (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  format TEXT, -- csv, xlsx, pdf
  filter_criteria JSONB,
  file_url TEXT,
  exported_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Cleanup old files
)
```

#### Indexes for Performance
```sql
CREATE INDEX idx_event_guests_status ON event_guests(status);
CREATE INDEX idx_event_guests_token ON event_guests(token);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_delivery_events_guest ON delivery_events(event_guest_id);
```

---

### 4.3 AI Integration Strategy

#### Claude API Usage (Primary)

**Use Cases**:
1. **Message Personalization** (Initial Requests)
   - Input: Event type, guest relationship, tone, context
   - Output: Personalized 1-2 sentence request message
   - Model: Claude Sonnet 4.5
   - Estimated tokens: ~500 input + 150 output per request
   - Cost: ~$0.005 per message generation

2. **Reminder Message Variation**
   - Input: Original message, reminder number, days since last contact
   - Output: Varied follow-up message
   - Model: Claude Sonnet 4.5
   - Cost: ~$0.004 per reminder

3. **Duplicate Contact Detection**
   - Input: New contact + existing contacts with similar names
   - Output: Confidence score + merge recommendations
   - Model: Claude Haiku (faster, cheaper)
   - Cost: ~$0.001 per check

**Prompt Engineering Examples**:

```typescript
// Message personalization prompt
const personalizeMessagePrompt = `You are helping someone request a mailing address for ${eventType}.

Context:
- Event: ${eventName} on ${eventDate}
- Recipient relationship: ${relationship}
- Desired tone: ${tone}
- Additional context: ${userContext}

Generate a brief, natural message (1-2 sentences) asking for their mailing address.
Include that there will be a link to submit (use placeholder [link]).
Sound human, not robotic. Match the tone exactly.

Bad example (too formal): "I am writing to request your current mailing address for the purpose of sending an invitation."
Good example (warm_casual): "Hey! We're sending invites for our graduation party and need your address. Mind filling out this quick form? [link]"

Generate only the message text, no explanation.`;
```

#### ChatGPT API Usage (Secondary - Cost Optimization)

**Use Cases**:
1. **Address Validation & Correction**
   - Input: Raw user-submitted address
   - Output: Standardized address + confidence score + error flags
   - Model: GPT-4o mini
   - Cost: ~$0.0003 per validation (ultra-low cost for high volume)

2. **CSV Import Field Mapping Suggestions**
   - Input: CSV column headers
   - Output: Suggested field mappings
   - Model: GPT-4o mini

**Example Address Validation**:

```typescript
const validateAddressPrompt = `Validate this address and return JSON:
Address: ${userSubmittedAddress}

Return format:
{
  "isValid": boolean,
  "confidence": "high" | "medium" | "low",
  "corrected": {
    "line1": "...",
    "line2": "...",
    "city": "...",
    "state": "...",
    "zip": "..."
  },
  "warnings": ["Missing apartment number", "Unusual ZIP for this city"],
  "suggestions": "Did you mean '123 Main St' instead of '123 Man St'?"
}`;
```

---

### 4.4 Vercel Deployment Strategy

#### Project Structure
```
cardulary/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, signup)
│   ├── (dashboard)/        # Protected routes
│   │   ├── events/
│   │   ├── contacts/
│   │   └── settings/
│   ├── api/                # API routes
│   │   ├── ai/             # Claude/GPT endpoints
│   │   ├── events/
│   │   ├── guests/
│   │   ├── webhooks/       # Twilio, Resend webhooks
│   │   └── cron/           # Scheduled jobs
│   └── submit/[token]/     # Public guest submission pages
├── components/
│   ├── ui/                 # shadcn components
│   ├── forms/
│   └── layouts/
├── lib/
│   ├── db/                 # Drizzle schema & queries
│   ├── ai/                 # Claude/GPT utilities
│   ├── email/              # Resend templates
│   └── sms/                # Twilio utilities
├── public/
└── vercel.json             # Deployment config
```

#### Environment Variables (Production)
```bash
# Database
DATABASE_URL=postgresql://...neon.tech

# Authentication
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# AI
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Communication
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# External APIs
GOOGLE_PLACES_API_KEY=...

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Security
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://cardulary.app
```

#### Vercel Configuration (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/cleanup-expired-exports",
      "schedule": "0 3 * * *"
    }
  ],
  "regions": ["iad1"],
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

#### Deployment Workflow
1. **Development**: Local Next.js dev server + Neon database branch
2. **Staging**: Automatic deployment from `develop` branch → Vercel preview URL
3. **Production**: Manual promotion from staging or auto-deploy from `main` branch
4. **Rollback**: Instant rollback via Vercel dashboard to previous deployment

#### Performance Optimizations
- **Static Generation**: Marketing pages (/, /pricing, /features)
- **ISR (Incremental Static Regeneration)**: Event dashboards (revalidate every 60s)
- **Edge Functions**: Token validation for guest submission pages (low latency globally)
- **Image Optimization**: Vercel automatic image optimization for email templates
- **Bundle Analysis**: @next/bundle-analyzer to keep JS bundle < 200KB

---

### 4.5 GitHub Workflow Recommendations

#### Branch Strategy (GitHub Flow)
```
main (production)
  ├── develop (staging)
      ├── feature/ai-message-personalization
      ├── feature/sms-integration
      └── bugfix/csv-import-validation
```

#### Repository Setup
```
cardulary/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Run tests on PR
│   │   ├── deploy-preview.yml        # Auto-deploy to Vercel preview
│   │   └── deploy-production.yml     # Deploy to production on main merge
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/                            # Git hooks (pre-commit linting)
├── src/
└── tests/
```

#### CI/CD Pipeline (GitHub Actions)

**ci.yml** - Run on every PR:
```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

**deploy-production.yml** - Deploy on merge to main:
```yaml
name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Code Quality Tools
- **ESLint**: Next.js recommended config + custom rules
- **Prettier**: Auto-formatting on commit
- **TypeScript**: Strict mode enabled
- **Husky**: Pre-commit hooks for linting
- **Commitlint**: Enforce conventional commits (feat:, fix:, docs:, etc.)

#### Testing Strategy
- **Unit Tests**: Vitest for utility functions (AI prompt builders, address parsers)
- **Integration Tests**: API route testing with MSW (Mock Service Worker)
- **E2E Tests**: Playwright for critical flows (event creation, guest submission)
- **Coverage Target**: 70% for MVP, 85% for V2

---

## 5. Business Analysis

### 5.1 Development Cost Estimate

#### Assumptions
- Solo developer (full-stack, experienced with Next.js/React)
- 40 hours/week development time
- Hourly rate: $100/hr (market rate for senior full-stack dev)
- MVP scope: All features in Section 3 (MVP Features)

#### Time Breakdown by Feature Area

| Feature Area | Estimated Hours | Cost |
|--------------|-----------------|------|
| **Setup & Infrastructure** | | |
| - Project setup, Vercel/Neon config, CI/CD | 8 | $800 |
| - Database schema design & migrations | 12 | $1,200 |
| - Authentication setup (Clerk integration) | 6 | $600 |
| **Core Features** | | |
| - User account management & settings | 16 | $1,600 |
| - Event creation & management UI | 24 | $2,400 |
| - Guest list management (CRUD, search, filters) | 32 | $3,200 |
| - CSV import with field mapping | 20 | $2,000 |
| **AI Integration** | | |
| - Claude API integration for message personalization | 16 | $1,600 |
| - GPT API for address validation | 12 | $1,200 |
| - Prompt engineering & testing | 16 | $1,600 |
| - AI reminder variation logic | 12 | $1,200 |
| **Communication** | | |
| - Email integration (Resend + templates) | 20 | $2,000 |
| - SMS integration (Twilio + webhooks) | 24 | $2,400 |
| - Delivery tracking & status updates | 16 | $1,600 |
| - Link generation & tracking middleware | 8 | $800 |
| **Guest Submission** | | |
| - Public submission page UI | 16 | $1,600 |
| - Address autocomplete (Google Places) | 8 | $800 |
| - Form validation & submission handling | 12 | $1,200 |
| - Thank you page & edit window logic | 6 | $600 |
| **Reminders & Automation** | | |
| - Reminder scheduling system | 20 | $2,000 |
| - Cron job setup & testing | 8 | $800 |
| - Reminder configuration UI | 12 | $1,200 |
| **Contact Database** | | |
| - Master contact list UI | 20 | $2,000 |
| - Duplicate detection logic | 16 | $1,600 |
| - Tagging & grouping system | 12 | $1,200 |
| - Contact reuse across events | 8 | $800 |
| **Export/Import** | | |
| - Export to CSV/Excel/PDF | 20 | $2,000 |
| - Pre-built integrations (Minted, Shutterfly, etc.) | 24 | $2,400 |
| - Google Contacts import | 16 | $1,600 |
| **UI/UX & Polish** | | |
| - Responsive design & mobile optimization | 32 | $3,200 |
| - Component library setup (shadcn/ui) | 8 | $800 |
| - Loading states, error handling, animations | 20 | $2,000 |
| - Accessibility improvements (WCAG AA) | 16 | $1,600 |
| **Testing & QA** | | |
| - Unit test coverage (key utilities) | 24 | $2,400 |
| - Integration tests (API routes) | 16 | $1,600 |
| - E2E tests (critical flows) | 20 | $2,000 |
| - Manual QA & bug fixing | 32 | $3,200 |
| **Documentation & Deployment** | | |
| - User documentation & onboarding | 12 | $1,200 |
| - API documentation | 8 | $800 |
| - Deployment scripts & monitoring setup | 8 | $800 |
| **Buffer for unknowns (15%)** | 70 | $7,000 |
| **TOTAL** | **540 hours** | **$54,000** |

#### Timeline
- **Full-time (40 hrs/week)**: 13.5 weeks (3.4 months)
- **Part-time (20 hrs/week)**: 27 weeks (6.8 months)
- **Realistic (accounting for planning, meetings, breaks)**: **4-5 months full-time**

---

### 5.2 Monthly Operating Costs (Infrastructure)

#### Year 1 Assumptions
- 500 active users (event organizers)
- Average 2 events per user per year
- Average 75 guests per event
- Total events: 1,000/year
- Total guest requests sent: 75,000/year (6,250/month)
- 40% SMS, 60% email split
- 2.5 reminders sent per guest on average
- Total messages: ~187,500/year (15,625/month)

| Service | Usage | Cost | Notes |
|---------|-------|------|-------|
| **Vercel Pro** | Hosting + edge functions | $20/mo | Needed for cron jobs & higher limits |
| **Neon PostgreSQL** | 5 GB storage, 100 hours compute | $19/mo | Generous free tier initially, paid at scale |
| **Resend Email** | 9,375 emails/month | $0 (then $20/mo) | Free up to 3,000/mo, then $20 for 50k |
| **Twilio SMS** | 6,250 SMS/month @ $0.0079 each | $49/mo | U.S. only, international costs more |
| **Claude API** | ~100k tokens/month (message gen) | $30/mo | Sonnet 4.5: $3/M input, $15/M output |
| **OpenAI API** | ~500k tokens/month (address validation) | $5/mo | GPT-4o mini: $0.15/1M input, $0.60/1M output |
| **Google Places API** | 1,000 autocomplete requests/mo | $6/mo | $2.83 per 1,000 autocomplete sessions |
| **Vercel Blob Storage** | 10 GB storage, 50 GB bandwidth | $0 (then $5/mo) | Free tier covers early usage |
| **Sentry** | Error tracking | $0 | Free tier: 5k errors/month |
| **Domain** | cardulary.app | $1/mo | ~$12/year |
| **Misc/Buffer** | SSL, backups, monitoring | $10/mo | |
| **TOTAL (Month 1-3)** | | **$140/mo** | During free tiers |
| **TOTAL (Month 4+)** | | **$165/mo** | After free tier expiration |

#### Scaling Costs (Year 2 - 5,000 users, 10x traffic)

| Service | Scaled Usage | Cost |
|---------|--------------|------|
| Vercel Pro | Same (optimized architecture) | $20/mo |
| Neon | 50 GB storage, 500 hours compute | $69/mo |
| Resend | 93,750 emails/month | $80/mo |
| Twilio | 62,500 SMS/month | $494/mo |
| Claude API | 1M tokens/month | $300/mo |
| OpenAI API | 5M tokens/month | $50/mo |
| Google Places | 10,000 requests/month | $28/mo |
| Blob Storage | 100 GB | $15/mo |
| **TOTAL (Year 2)** | | **$1,056/mo** |

---

### 5.3 Revenue Projections

#### Pricing Strategy Recommendation

**PWA (Web App) Model**: One-time purchase with lifetime access
- **Tier 1 (Launch)**: $6.99 - Lower friction for initial adoption
- **Tier 2 (Growth)**: $9.99 - After 500 downloads, raise price
- **Tier 3 (Mature)**: $14.99 - Premium positioning after product-market fit

**No recurring costs for users**: Simplicity drives conversions in consumer apps

#### Revenue Model: Transaction-Based Hybrid
Given PWA strategy, recommend **freemium + one-time unlock**:

1. **Free Tier**:
   - 1 active event
   - Up to 25 guests per event
   - Email-only sending (no SMS)
   - Basic export (CSV only)
   - Cardulary branding on guest submission pages

2. **Pro (One-time $9.99)**:
   - Unlimited events
   - Unlimited guests
   - SMS + email sending
   - All export formats + integrations
   - Remove branding
   - Priority support

**Rationale**:
- Freemium captures casual users (holiday card senders with small lists)
- $9.99 one-time is impulse-purchase territory for serious event planners
- No subscription fatigue = higher conversion rates (industry benchmark: 2-5% for freemium, vs. 1-2% for subscription apps)

#### Market Size Analysis

**Total Addressable Market (TAM)**:
- U.S. weddings per year: ~2 million
- U.S. graduation parties: ~3.7 million (high school + college)
- Birthday/anniversary milestone events: ~15 million
- Holiday card senders: ~1.5 billion cards sent = ~50 million households sending
- **TAM: ~70 million potential events/year in U.S.**

**Serviceable Addressable Market (SAM)**:
- Event organizers likely to use digital tools: 30% of TAM = **21 million events**
- Average willingness to pay: $10
- **SAM: $210 million/year**

**Serviceable Obtainable Market (SOM)** - Year 1:
- Realistic market penetration: 0.01% of SAM (conservative)
- **Year 1 Target: 2,100 paying users**

#### Revenue Projections (3 Scenarios)

**CONSERVATIVE** (0.005% market penetration)
| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 5,000 | 15,000 | 40,000 |
| Paid conversions (2%) | 100 | 300 | 800 |
| Revenue @ $9.99 | $999 | $2,997 | $7,992 |
| Monthly avg | $83 | $250 | $666 |
| **Net profit** (after $165/mo ops) | -$1,181 | +$1,017 | +$5,712 |

**MODERATE** (0.01% market penetration)
| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 12,000 | 35,000 | 85,000 |
| Paid conversions (3.5%) | 420 | 1,225 | 2,975 |
| Revenue @ $9.99 | $4,196 | $12,238 | $29,720 |
| Monthly avg | $350 | $1,020 | $2,477 |
| **Net profit** (after $165/mo ops) | +$2,216 | +$10,258 | +$27,740 |

**OPTIMISTIC** (0.02% market penetration + viral growth)
| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 25,000 | 75,000 | 180,000 |
| Paid conversions (4.5%) | 1,125 | 3,375 | 8,100 |
| Revenue @ $9.99 | $11,239 | $33,716 | $80,919 |
| Monthly avg | $937 | $2,810 | $6,743 |
| **Net profit** (after ops) | +$9,259 | +$30,036 | +$76,239 |

**Key Assumptions**:
- 70% of revenue occurs Q4 (holiday season) + Q1-Q2 (wedding season)
- Organic growth via word-of-mouth (each user refers 0.5 new users/year)
- No paid marketing spend in Year 1
- One-time purchase model means each user only pays once (focus on new user acquisition)

---

### 5.4 Break-Even Analysis

#### One-Time Development Cost Recovery

**Scenario**: Solo developer builds for $54k opportunity cost

| Scenario | Year 1 Revenue | Cumulative by EOY2 | Months to Break-Even |
|----------|----------------|-------------------|---------------------|
| Conservative | $999 | $3,996 | Never (pivot or shutdown) |
| Moderate | $4,196 | $16,434 | 38 months (3.2 years) |
| Optimistic | $11,239 | $44,955 | 14 months (1.2 years) |

#### Monthly Operating Break-Even

**Fixed costs**: $165/month (infrastructure)
**Required paid users/month**: 17 users @ $9.99 = $170

**Verdict**: Operating break-even is achievable within **first 3 months** in moderate scenario.

---

### 5.5 Exit Valuation Scenarios

#### SaaS Acquisition Multiples (2024-2025 Market)
- **Micro-SaaS (< $1M ARR)**: 2-4x ARR
- **Small SaaS ($1-5M ARR)**: 4-6x ARR
- **Growth SaaS ($5M+ ARR)**: 6-10x ARR

**Special considerations for Cardulary**:
- One-time purchase model = lower valuation than subscription
- Apply 0.5x discount: **1-3x ARR equivalent for one-time purchases**
- ARR equivalent = Trailing 12-month revenue

#### Valuation Estimates

**Year 1 (Conservative)**
- Revenue: $999
- ARR equivalent: $999
- Valuation range: $1,000 - $3,000
- **Verdict**: Not sellable (too early, no traction)

**Year 3 (Moderate)**
- Revenue: $29,720
- ARR equivalent: $29,720
- Valuation range: $30k - $90k (1-3x)
- **Verdict**: Lifestyle business, not VC-backable

**Year 3 (Optimistic)**
- Revenue: $80,919
- ARR equivalent: $80,919
- Valuation range: $81k - $243k (1-3x)
- **Verdict**: Acquihire potential for event tech companies

#### Strategic Acquisition Scenarios (Non-Financial)

More realistic exit: **Acquihire or feature acquisition**

**Potential Acquirers**:
1. **Zola, The Knot, Joy** (wedding platforms) - Want to add address collection to their suite
2. **Minted, Shutterfly** (stationery companies) - Reduce customer friction by owning collection workflow
3. **Evite, Paperless Post** (digital invitations) - Add physical mail option
4. **Constant Contact, Mailchimp** (email marketing) - Expand into event vertical

**Acquisition range**: $100k - $500k (based on user base + technology)
- User base matters more than revenue for strategic buyers
- 50,000+ active users = attractive
- Clean codebase + integrations = added value

**Timeline to exit**: 2-3 years with moderate growth

---

### 5.6 Annual Operating Cost Summary (3-Year View)

| Expense Category | Year 1 | Year 2 | Year 3 |
|------------------|--------|--------|--------|
| **Infrastructure** | $1,980 | $12,672 | $18,000 |
| Vercel | $240 | $240 | $240 |
| Neon Database | $228 | $828 | $960 |
| Resend (Email) | $240 | $960 | $1,200 |
| Twilio (SMS) | $588 | $5,928 | $8,000 |
| Claude API | $360 | $3,600 | $5,000 |
| OpenAI API | $60 | $600 | $800 |
| Google Places API | $72 | $288 | $360 |
| Storage/Misc | $192 | $228 | $240 |
| **Marketing** | $0 | $5,000 | $10,000 |
| SEO/Content | $0 | $2,000 | $4,000 |
| Paid ads (Google/Meta) | $0 | $3,000 | $6,000 |
| **Support/Tools** | $600 | $1,200 | $2,400 |
| Customer support (part-time) | $0 | $600 | $1,200 |
| Analytics/monitoring | $600 | $600 | $1,200 |
| **TOTAL OPEX** | $2,580 | $18,872 | $30,400 |

**Key Insights**:
- Year 1: Minimal spend, validate product-market fit
- Year 2: Ramp marketing after PMF, scale infrastructure
- Year 3: Growth mode, invest in customer acquisition

---

## 6. Complexity Rating

### RATING: **MEDIUM** (Development timeline: 4-5 months to beta launch)

### Justification

**Factors elevating from EASY**:
1. **Multi-channel communication**: Email + SMS integration with webhook handling adds complexity
2. **AI integration**: Dual API management (Claude + OpenAI) requires prompt engineering and fallback logic
3. **Third-party integrations**: Google Places, multiple export formats, OAuth providers
4. **Background jobs**: Reminder scheduling system with cron job orchestration
5. **Data modeling**: Relational schema with contacts, events, guests, submissions requires careful normalization
6. **Security**: Token-based guest access, rate limiting, abuse prevention

**Factors preventing COMPLEX rating**:
1. **Single user role** (for MVP): No multi-tenant permissions or collaboration
2. **No real-time features**: No WebSockets, no live collaboration, no chat
3. **Established tech stack**: Next.js + Vercel is well-documented with minimal DevOps
4. **Serverless architecture**: No infrastructure management, auto-scaling handled by providers
5. **Limited business logic**: Mostly CRUD with straightforward workflows (send request → collect → export)

### Risk Mitigation to Stay MEDIUM
- Use proven libraries (shadcn/ui, Drizzle ORM, Resend, Twilio SDKs)
- Defer V2 features (collaboration, analytics) to avoid scope creep
- Leverage Vercel templates for auth and database setup
- Allocate 15% time buffer for unknowns (already included in estimates)

---

## 7. Risks & Mitigations

### 7.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **AI API costs spiral out of control** | Medium | High | 1) Implement aggressive caching for common prompts<br>2) Add usage caps per user (e.g., 100 AI-generated messages/month)<br>3) Graceful fallback to templates if API fails<br>4) Monitor costs daily with alerts at $100 threshold |
| **SMS delivery costs exceed projections** | Medium | Medium | 1) Default to email, require explicit SMS opt-in<br>2) Show real-time cost preview before bulk sends<br>3) Implement SMS credits system (buy packs of 100 SMS for $10)<br>4) Use Twilio verify instead of sending codes via SMS |
| **Email deliverability issues (spam filters)** | Medium | High | 1) Authenticate domain with SPF/DKIM/DMARC<br>2) Use established provider (Resend) with good reputation<br>3) Warm up sending gradually (start with 100/day)<br>4) Include clear unsubscribe, avoid spam trigger words<br>5) Monitor bounce rates, pause sending if > 5% |
| **Google Places API rate limits** | Low | Medium | 1) Implement client-side debouncing (wait 300ms after typing stops)<br>2) Cache autocomplete results for 24 hours<br>3) Fallback to manual address entry if quota exceeded<br>4) Upgrade to higher quota tier ($200/mo for 100k requests) |
| **Database performance degradation at scale** | Low | Medium | 1) Proper indexing on high-query columns<br>2) Use Neon connection pooling<br>3) Implement pagination for large guest lists (50 per page)<br>4) Archive old events (> 2 years) to cold storage |
| **PWA installation confusion (not native app)** | High | Low | 1) Clear messaging: "No app store download needed"<br>2) Onboarding tutorial showing "Add to Home Screen"<br>3) Browser-specific install prompts (iOS Safari vs. Chrome)<br>4) FAQ addressing "Where's the app in App/Play Store?" |

---

### 7.2 Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Low product-market fit (people don't pay $10 for this)** | Medium | Critical | 1) Launch with generous free tier to validate usage<br>2) Survey free users on willingness to pay<br>3) A/B test pricing ($6.99 vs. $9.99 vs. $14.99)<br>4) Pivot to B2B (event planners) if B2C fails<br>5) Add revenue stream: charge mailing companies for leads |
| **Seasonal revenue concentration (Q4/Q1 only)** | High | Medium | 1) Diversify use cases: corporate events, realtors, nonprofits<br>2) Build email marketing for off-season re-engagement<br>3) Add "birthday club" feature (year-round usage)<br>4) Offer annual planning package (all 2025 events for $19.99) |
| **Competition from established players** | Medium | High | 1) Niche positioning: "Address collection ONLY, done perfectly"<br>2) Speed to market: Launch before competitors notice<br>3) Lock in integrations with mailing companies<br>4) Build community/content moat (SEO for "how to collect addresses for wedding") |
| **Privacy concerns kill SMS sending** | Low | Medium | 1) Explicit consent workflow ("X will send you an SMS from Cardulary")<br>2) TCPA compliance (opt-out instructions in every SMS)<br>3) Offer email-only mode<br>4) Use short code instead of long code for better deliverability |
| **Low viral coefficient (users don't refer friends)** | High | High | 1) Incentive: "Refer 3 friends, get $5 credit for SMS"<br>2) Built-in virality: Guest submission page says "Create your own event with Cardulary"<br>3) Post-event prompt: "Planning another event? Copy your contact list"<br>4) Social proof: "10,000 events organized with Cardulary" badge |

---

### 7.3 Cost Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Free tier abuse (create 100 events, never pay)** | Medium | Medium | 1) Require credit card for SMS sending (even in free tier)<br>2) Limit free tier to 1 event every 30 days<br>3) Detect duplicate accounts (email/phone fingerprinting)<br>4) Soft paywall: Export locked until payment |
| **Underestimated development time (feature creep)** | High | High | 1) **Strict MVP scope**: Defer all V2 features to post-launch<br>2) Weekly progress reviews with time tracking<br>3) Use feature flags to ship incomplete features dark<br>4) Hire contractor for specialized tasks (e.g., export integrations) |
| **Ongoing API cost exceeds revenue per user** | Medium | Critical | 1) **Unit economics tracking**: Log AI/SMS cost per user<br>2) Cap AI usage: Max 50 AI-generated messages per user<br>3) Increase price if LTV < CAC + API costs<br>4) Switch to cheaper AI models (Haiku instead of Sonnet) |
| **Maintenance burden prevents feature development** | Low | Medium | 1) Automate monitoring with error tracking (Sentry)<br>2) Build comprehensive test suite (70% coverage)<br>3) Document common support issues in FAQ<br>4) Use Vercel's auto-scaling to avoid infra babysitting |

---

## 8. Success Metrics

### 8.1 Key Performance Indicators (KPIs)

#### Acquisition Metrics
| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) | Measurement |
|--------|------------------|------------------|-------------------|-------------|
| **Monthly Active Users (MAU)** | 200 | 600 | 1,500 | Unique logins per month |
| **New signups/month** | 150 | 400 | 1,000 | Registration completions |
| **Signup source breakdown** | Organic: 60%<br>Referral: 30%<br>Paid: 10% | Organic: 50%<br>Referral: 35%<br>Paid: 15% | Balanced mix | UTM tracking |
| **Signup → event creation rate** | 60% | 70% | 75% | % of users who create ≥1 event within 7 days |

#### Engagement Metrics
| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) | Measurement |
|--------|------------------|------------------|-------------------|-------------|
| **Avg guests per event** | 40 | 55 | 65 | Median guest count across all events |
| **Address collection completion rate** | 55% | 65% | 70% | % of invited guests who submit address |
| **Time to first address request sent** | < 10 min | < 8 min | < 5 min | From signup to first request |
| **Events with ≥2 reminders sent** | 40% | 50% | 60% | % of events using automation |
| **Repeat usage (multi-event users)** | 15% | 25% | 35% | % of users who create ≥2 events |

#### Monetization Metrics
| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) | Measurement |
|--------|------------------|------------------|-------------------|-------------|
| **Free → Paid conversion rate** | 2.5% | 3.5% | 4.5% | % of free users who upgrade |
| **Revenue/month** | $150 | $400 | $900 | Total revenue (one-time purchases) |
| **Average revenue per user (ARPU)** | $0.75 | $1.00 | $1.20 | Revenue ÷ total users |
| **Payback period** | N/A (organic) | 30 days | 45 days | If paid ads launch |

#### Retention Metrics
| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) | Measurement |
|--------|------------------|------------------|-------------------|-------------|
| **7-day retention** | 40% | 50% | 55% | % of users who return within 7 days |
| **30-day retention** | 20% | 25% | 30% | % of users who return within 30 days |
| **Churn rate** | N/A (one-time purchase) | - | - | Not applicable |

#### Technical Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page load time (P95)** | < 2 seconds | Vercel Analytics |
| **API response time (P95)** | < 500ms | Custom logging |
| **Error rate** | < 0.5% | Sentry |
| **Uptime** | > 99.5% | Vercel status |
| **Email deliverability** | > 95% | Resend dashboard |
| **SMS delivery rate** | > 98% | Twilio webhooks |

---

### 8.2 Launch Criteria (Go/No-Go Checklist)

#### Pre-Beta Launch (Private Testing)
- [ ] All MVP features functional (no critical bugs)
- [ ] Database schema finalized and migrated
- [ ] Authentication working (email/password + OAuth)
- [ ] Email sending tested with ≥3 providers (Gmail, Outlook, Yahoo)
- [ ] SMS sending tested with ≥2 carriers (Verizon, AT&T)
- [ ] Guest submission flow tested on 5 mobile devices
- [ ] Export working for ≥3 integrations (CSV, Minted, Shutterfly)
- [ ] AI message generation tested with 20+ scenarios
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (PostHog or Vercel Analytics)
- [ ] Privacy policy + Terms of Service published
- [ ] Support email configured (support@cardulary.app)
- [ ] 10 beta testers recruited (friends/family with upcoming events)

#### Public Launch (V1.0)
- [ ] Beta testing complete with ≥50 real events created
- [ ] ≥500 addresses successfully collected via beta
- [ ] NPS score from beta testers ≥40
- [ ] All P0/P1 bugs fixed (blocking issues resolved)
- [ ] Email deliverability validated (< 2% bounce rate in beta)
- [ ] AI costs validated (< $0.50 per user in beta)
- [ ] Landing page live with SEO optimization
- [ ] Payment processing tested (Stripe or Paddle integration)
- [ ] Onboarding flow optimized (≥60% completion rate in beta)
- [ ] Documentation complete (FAQ, help center, video tutorials)
- [ ] Social media accounts created (Twitter, Instagram)
- [ ] Launch announcement drafted (Product Hunt, Reddit, wedding forums)
- [ ] Customer support system ready (Intercom or plain email)
- [ ] Monitoring dashboards configured (costs, errors, usage)

#### Growth Phase (Post-Launch Month 3)
- [ ] ≥1,000 signups achieved
- [ ] ≥100 paid conversions
- [ ] Free → Paid conversion rate ≥2.5%
- [ ] Address collection completion rate ≥55%
- [ ] Monthly revenue ≥ monthly operating costs (break-even)
- [ ] Referral program launched
- [ ] SEO content published (≥10 blog posts)
- [ ] First integration partnership signed (Minted or Shutterfly)

---

### 8.3 Analytics Implementation

#### Events to Track (PostHog or Mixpanel)

**User Journey Events**:
```javascript
// Signup & Onboarding
- user_signed_up {method: 'email' | 'google' | 'apple'}
- onboarding_step_viewed {step: 1-5}
- onboarding_completed {time_to_complete_seconds}

// Event Creation
- event_created {event_type, guest_count, custom_fields_count}
- guests_imported {method: 'csv' | 'manual' | 'google_contacts', count}
- custom_field_added {field_type}

// Messaging
- message_personalized {tone, ai_used: true/false}
- request_sent {channel: 'email' | 'sms', bulk: true/false, guest_count}
- reminder_scheduled {intervals: [3, 7, 14]}
- reminder_sent {reminder_number, days_since_initial}

// Guest Interaction
- submission_page_viewed {token}
- address_submitted {country, custom_fields_filled_count}
- address_autocomplete_used {source: 'google_places'}

// Monetization
- paywall_viewed {trigger: 'guest_limit' | 'sms_send' | 'export'}
- upgrade_clicked {from_screen}
- payment_completed {amount, method}

// Export
- export_initiated {format: 'csv' | 'xlsx' | 'pdf', integration}
- export_downloaded

// Errors
- api_error {endpoint, error_code}
- email_bounced {reason}
- sms_failed {reason}
```

#### Cohort Analysis
- Weekly cohorts by signup date
- Track conversion to paid by cohort
- Retention curves by cohort
- Feature adoption by cohort (who uses SMS vs. email-only?)

#### A/B Tests to Run Post-Launch
1. **Pricing**: $6.99 vs. $9.99 vs. $14.99
2. **Free tier limit**: 25 vs. 50 guests
3. **Onboarding flow**: 3-step vs. 5-step wizard
4. **CTA copy**: "Upgrade Now" vs. "Unlock SMS Sending" vs. "Go Pro"
5. **Landing page hero**: Focus on pain (chaos of spreadsheets) vs. gain (save time)

---

## 9. User Stories (Detailed)

### 9.1 Event Organizer Stories

#### Epic: Event Setup
**US-01**: As a wedding planner, I want to create a new event with my wedding date and customize the message guests will see, so the request feels personal and on-brand.

**Acceptance Criteria**:
- I can set event name, type (wedding), and date
- I can write a custom welcome message that guests see on submission page
- I can preview the guest-facing page before sending requests
- The system saves my draft automatically

---

**US-02**: As a holiday card sender, I want to import my contacts from Google Contacts so I don't have to manually type 100 addresses.

**Acceptance Criteria**:
- I can authenticate with Google OAuth
- The system shows me a preview of contacts to import (with checkboxes to select)
- I can map Google fields (e.g., "Home Address") to Cardulary fields
- Duplicates are detected and I can choose to merge or skip
- Import completes with a summary (X imported, Y skipped, Z errors)

---

**US-03**: As a graduation party host, I want to upload a CSV of guest names and emails from my old Excel spreadsheet, so I can reuse data I already collected.

**Acceptance Criteria**:
- I can download a CSV template with required columns
- I can upload my CSV file (drag-and-drop or file picker)
- The system validates required fields and shows errors clearly
- I can map my column headers to Cardulary fields if they don't match
- Invalid rows are flagged with specific error messages (e.g., "Row 15: Missing email")

---

#### Epic: Requesting Addresses

**US-04**: As an event organizer, I want to send a personalized address request to each guest via their preferred contact method (email or text), so I get higher response rates.

**Acceptance Criteria**:
- I can select guests individually or in bulk
- The system auto-detects available contact methods (email/SMS) per guest
- I can preview the message with merge fields populated for a sample guest
- I can schedule the send for a specific date/time or send immediately
- The system confirms successful sends and flags any failures

---

**US-05**: As a busy parent, I want AI to write a warm, casual message requesting addresses for my kid's birthday party, so I don't have to spend 30 minutes crafting the perfect text.

**Acceptance Criteria**:
- I can select "AI Personalize" mode
- I choose relationship (family/friends/etc.) and tone (warm & casual)
- The AI generates a 1-2 sentence message in < 5 seconds
- I can regenerate if I don't like the first version
- I can edit the AI-generated message before sending
- The message includes a unique link placeholder `[link]`

---

**US-06**: As a reunion organizer, I want to send reminders to people who haven't responded after 1 week, without manually tracking who needs a nudge.

**Acceptance Criteria**:
- I can configure reminder intervals (e.g., 3 days, 7 days, 14 days)
- Reminders are automatically sent only to guests with "Pending" status
- Each reminder uses varied language (not identical to initial request)
- I receive a notification when reminders are sent
- I can cancel all pending reminders for an event
- I can disable reminders for specific guests

---

#### Epic: Managing Responses

**US-07**: As an organizer, I want to see real-time updates when guests submit their addresses, so I know who still needs follow-up.

**Acceptance Criteria**:
- Guest list shows color-coded status indicators (gray/yellow/green/red)
- Status updates immediately when a guest submits (no page refresh needed)
- I can sort and filter by status (show only "Pending")
- I can see the timestamp of last activity per guest
- Dashboard shows response rate percentage (e.g., "42 of 75 responded - 56%")

---

**US-08**: As a detail-oriented planner, I want to edit guest information (add nickname, mark gift received) as I collect details throughout the planning process.

**Acceptance Criteria**:
- I can click any field in the guest list to edit inline
- Changes save automatically (with visual confirmation)
- I can add custom fields specific to my event (e.g., "Dietary restrictions", "Plus-one name")
- Custom field data persists and exports with other data

---

**US-09**: As a user planning multiple events, I want to reuse my contact database for future events so I don't have to re-collect addresses from the same people.

**Acceptance Criteria**:
- I can view my master contact list (all guests across all events)
- When creating a new event, I can select "Copy from previous event"
- Previously submitted addresses auto-populate for returning guests
- I can create contact groups/tags (e.g., "College Friends") and add all tagged contacts to a new event
- The system prevents duplicate contacts (merges if email/phone matches)

---

#### Epic: Exporting Data

**US-10**: As a couple getting married, I want to export my collected addresses directly in Minted's format, so I can order invitations without reformatting data.

**Acceptance Criteria**:
- I select "Export" → "Minted format"
- The system generates a CSV with Minted's exact column names and formatting
- Only guests with status "Completed" are included (configurable)
- The file downloads instantly (or via email for large lists)
- Export includes all custom fields I collected

---

**US-11**: As an organizer, I want to print address labels sorted by ZIP code, so I can get bulk mailing discounts from USPS.

**Acceptance Criteria**:
- I select "Export" → "Print Labels (PDF)"
- I choose label template (Avery 5160, 8160, etc.)
- Addresses are sorted by ZIP code automatically
- PDF is formatted for direct printing on label sheets
- I can preview before downloading

---

### 9.2 Guest (Address Submitter) Stories

**US-12**: As a wedding guest, I want to submit my address in under 60 seconds on my phone without creating an account, because I'm busy and hate unnecessary signups.

**Acceptance Criteria**:
- I receive a text/email with a link
- The link opens a mobile-friendly form (no login required)
- Address autocomplete suggests my full address after typing 5 characters
- I can submit with 3 taps (address autocomplete → confirm → submit)
- I see an immediate "Thank you" confirmation
- I receive a confirmation email/text with my submitted address

---

**US-13**: As a forgetful person, I want to edit my address after submitting because I realized I entered my old apartment number.

**Acceptance Criteria**:
- The confirmation page includes an "Edit submission" button
- I can edit within 24 hours of submission
- After editing, I see a new confirmation
- The organizer sees the updated address (old version is replaced, not duplicated)
- After 24 hours, the edit button is replaced with "Contact [organizer] to update"

---

**US-14**: As a privacy-conscious individual, I want clear information about how my address will be used before submitting.

**Acceptance Criteria**:
- The submission page clearly states: "Your address will only be used for [Event Name]"
- A link to the privacy policy is visible
- I can see who is requesting my address (organizer name + event name)
- There's a "We will never spam you" promise
- I can optionally opt out of future events from this organizer

---

## 10. Go-to-Market Strategy

### 10.1 Launch Plan (First 90 Days)

#### Pre-Launch (Weeks -4 to 0)
**Week -4**:
- Set up landing page with email capture ("Get early access")
- Create social media accounts (Twitter, Instagram, Reddit u/cardulary)
- Write 5 blog posts for SEO:
  - "How to Collect Addresses for Wedding Invitations (2025 Guide)"
  - "Free Address Collection Tool vs. Spreadsheets: Which is Better?"
  - "10 Wedding Invitation Mistakes to Avoid"
  - "The Complete Guide to Mailing Save-the-Dates"
  - "How to Organize Your Holiday Card List"
- Reach out to 10 wedding/event planning influencers for beta access

**Week -3**:
- Recruit 20 beta testers via wedding planning subreddits (r/weddingplanning has 500k members)
- Set up email drip campaign for waitlist (3 emails over 3 weeks)
- Create demo video (2 minutes, showing full workflow)
- Submit to Product Hunt "Upcoming" page

**Week -2**:
- Beta testing in full swing (goal: 50 events created, 500+ addresses collected)
- Fix critical bugs from beta feedback
- Prepare Product Hunt launch materials:
  - Tagline: "Collect mailing addresses from friends & family in minutes, not weeks"
  - First comment with full feature breakdown
  - Founder story (why I built this)
- Reach out to tech/productivity newsletters for launch coverage

**Week -1**:
- Final QA and polish
- Set up customer support email + canned responses
- Prepare launch day social media posts
- Schedule Product Hunt launch for Tuesday (best day for launches)

---

#### Launch Week (Week 0)
**Tuesday (Product Hunt Day)**:
- 12:01 AM PST: Launch on Product Hunt
- 6:00 AM: Post on Twitter, LinkedIn, Reddit (r/SideProject, r/Entrepreneur)
- 9:00 AM: Email waitlist (500+ emails) with "We're live!" announcement
- Throughout day: Engage with every Product Hunt comment, share in relevant Slack/Discord communities
- Goal: Top 5 product of the day = 500+ signups

**Wednesday-Friday**:
- Post in wedding Facebook groups (30+ groups with 10k+ members each)
  - Example: "I built a free tool to collect addresses for invitations - would love your feedback!"
- Share demo video on TikTok, Instagram Reels (event planning hashtags)
- Cold email 50 wedding planners offering free Pro accounts for testimonials
- Monitor analytics: Track signup sources, conversion rates, bugs

**Weekend**:
- Write "How I launched Cardulary" post-mortem blog
- Submit to Hacker News (if Product Hunt went well)
- Engage with early users on social media (ask for feedback, reshare their posts)

---

#### Weeks 2-4 (Growth Phase)
- **Content Marketing**: Publish 2 blog posts/week (SEO-focused)
- **Partnership Outreach**: Email Minted, Shutterfly, Zola requesting integration partnerships
- **Community Building**: Start weekly "Event Planning Tips" email newsletter
- **Influencer Seeding**: Send free Pro accounts to 20 wedding/lifestyle influencers
- **Paid Ads Test** (if budget allows): $500 Google Ads targeting "wedding address collection" keywords
- **Referral Program**: Add "Invite friends, get 100 free SMS credits" feature

---

#### Weeks 5-12 (Optimization Phase)
- **A/B Testing**: Test pricing ($6.99 vs $9.99), free tier limits, CTAs
- **Feature Iteration**: Implement top 3 user-requested features from feedback
- **SEO Scaling**: Publish 20+ long-tail keyword articles
  - "How to collect addresses for [specific event type]" (10 variations)
  - "[City] wedding invitation mailing services"
- **PR Push**: Submit to wedding/tech publications (Brides.com, TechCrunch, The Verge)
- **Integration Launches**: Announce each mailing service integration as a mini-launch
- **Customer Success**: Interview 10 power users for case studies/testimonials

---

### 10.2 Marketing Channels (Prioritized)

#### Tier 1 (Highest ROI, Start Immediately)
1. **SEO + Content Marketing** (Cost: $0, Time: High, Timeline: 3-6 months for results)
   - Target long-tail keywords with low competition
   - Example: "How to collect addresses for wedding invitations spreadsheet" (90 searches/mo, low competition)
   - Create ultimate guides (5,000+ words) that rank for years
   - Internal linking strategy to convert readers to signups

2. **Reddit/Forum Engagement** (Cost: $0, Time: Medium, Timeline: Immediate)
   - r/weddingplanning (500k members): Share genuinely helpful advice, mention tool naturally
   - r/LifeProTips: "LPT: Use a dedicated address collection tool instead of texting everyone individually"
   - Wedding planning Facebook groups (organic posting)
   - The Knot forum, WeddingWire forums

3. **Product Hunt & Directories** (Cost: $0, Time: Low, Timeline: Launch week)
   - Product Hunt (drives 500-2,000 signups if top 5)
   - BetaList, SideProjectors, Indie Hackers
   - Capterra, G2 (for credibility, not direct traffic)

#### Tier 2 (Medium ROI, Start Month 2-3)
4. **Influencer Partnerships** (Cost: Free accounts + affiliate %, Time: Medium)
   - Target micro-influencers (10k-100k followers) in wedding/event planning niche
   - Offer: Free Pro account + 20% commission on referrals
   - Platforms: Instagram, TikTok, YouTube (wedding vloggers)

5. **Email Newsletter Sponsorships** (Cost: $200-500/newsletter, Time: Low)
   - Wedding planning newsletters
   - Productivity newsletters (e.g., Martech Daily, Product Hunt newsletter)
   - Test 3 newsletters, track ROI, double down on winners

6. **Partnership Integrations** (Cost: $0, Time: High, Timeline: Month 3+)
   - Co-marketing with Minted, Shutterfly (they promote you to customers who need addresses)
   - Zola/The Knot integration (appear in their app marketplaces)
   - Eventbrite partnership (promote to event organizers)

#### Tier 3 (Lower ROI, Test Month 6+)
7. **Paid Search (Google Ads)** (Cost: $500-2,000/mo, Time: Low)
   - Target high-intent keywords: "collect addresses for wedding", "wedding address book"
   - Expected CPA: $5-10 per signup, $50-100 per paid conversion
   - Only scale if LTV > 3x CAC

8. **Social Media Ads (Meta)** (Cost: $500-2,000/mo, Time: Medium)
   - Target: Engaged (in relationship) + interested in weddings + ages 25-35
   - Creative: Before/after (chaotic spreadsheet vs. clean Cardulary dashboard)
   - Retargeting: Show ads to people who visited landing page but didn't sign up

9. **Affiliate Program** (Cost: 30% revenue share, Time: Low)
   - Recruit wedding bloggers, event planners, stationery designers
   - Provide custom landing pages + tracking links
   - Pay out monthly via PayPal/Stripe

---

### 10.3 Pricing Strategy (Detailed)

#### Recommended Model: **Freemium + One-Time Unlock**

**Free Tier** ("Starter"):
- 1 active event at a time
- Up to 25 guests per event
- Email sending only (no SMS)
- CSV export only
- Cardulary branding on guest submission pages
- No AI message personalization (templates only)
- 24-hour support response time

**Paid Tier** ("Pro" - $9.99 one-time):
- Unlimited events (lifetime)
- Unlimited guests
- Email + SMS sending
- All export formats (CSV, Excel, PDF, Minted, Shutterfly, etc.)
- Remove branding
- AI message personalization (up to 100 AI-generated messages/year)
- Priority email support (4-hour response time)
- Early access to new features

#### Alternative Model (If One-Time Fails): **Freemium + Usage-Based**

**Free Tier**: Same as above

**Pay-As-You-Go** (No subscription):
- $0.10 per SMS sent (buy in packs: 50 SMS for $5, 200 for $15)
- $2.99 per export to premium integrations (Minted, Shutterfly)
- $4.99 per event for advanced features (AI, remove branding, unlimited guests)

**Rationale**: Lower friction than subscription, users only pay for what they use

---

### 10.4 Competitive Landscape

| Competitor | Strengths | Weaknesses | Cardulary's Advantage |
|------------|-----------|------------|----------------------|
| **Google Forms** | Free, familiar, simple | No address-specific features, manual export, no reminders, no contact database | Purpose-built for address collection, automated reminders, persistent database |
| **Zola, The Knot, Joy** | Full wedding planning suite, high brand trust | Wedding-only, bloated, expensive ($200+), locked ecosystem | Multi-use case (any event), simple, affordable, data portability |
| **Postable (postable.com)** | Address collection + card mailing service | Forces you to buy cards through them ($$$), no data export | No vendor lock-in, export anywhere, one-time fee |
| **AddressBook by Joy** | Free with Joy account, clean UX | Requires full Joy signup, limited customization | Standalone tool, more flexible, AI personalization |
| **Spreadsheets (Excel/Sheets)** | Free, infinite customization | Manual everything, no automation, error-prone, time-consuming | 10x faster, automated, error-proof |

**Positioning Statement**:
"Cardulary is the fastest way to collect mailing addresses from your friends and family, without spreadsheets, spam, or subscriptions. Purpose-built for real events—weddings, graduations, parties, or holiday cards—with AI-powered requests that feel personal and export to any mailing service."

---

## 11. Future Roadmap (V2+)

### V2.1 - Collaboration (Q2 2026)
- Share event management with co-organizers
- Role-based permissions (Admin, Editor, Viewer)
- Activity log and comments
- Real-time collaboration (see who's online)

### V2.2 - Analytics & Insights (Q3 2026)
- Response rate benchmarks (compare to similar events)
- Best time to send analysis
- Geographic heatmap of guests
- Engagement dashboard (open rates, click rates)

### V2.3 - Payment & Registry Integration (Q4 2026)
- Gift tracking with dollar amounts
- Thank you card reminder workflow
- Registry link collection (Zola, Amazon, Target)
- Automated thank you note drafting (AI)

### V2.4 - Advanced AI Features (Q1 2027)
- AI guest grouping (detect friend clusters)
- Predictive response likelihood scoring
- Smart guest list suggestions
- Sentiment analysis of guest responses

### V2.5 - B2B/White-Label (Q2 2027)
- White-label for professional event planners
- Custom branding (logo, colors, domain)
- Client management dashboard
- Tiered pricing (per client or per event)
- API access for integrations

### V2.6 - International Expansion (Q3 2027)
- Multi-language support (Spanish, French, German)
- International address formats
- Currency localization
- Region-specific integrations (UK: Moonpig, Papier)

### V2.7 - Native Mobile Apps (Q4 2027)
- React Native or Flutter apps
- Push notifications for responses
- Offline mode (drafts sync when online)
- App Store + Google Play distribution

---

## 12. Technical Specifications (Developer Handoff)

### 12.1 Development Environment Setup

```bash
# Prerequisites
- Node.js 20.x LTS
- npm 10.x
- Git
- Vercel CLI
- Neon CLI (optional, for local database branching)

# Initial setup
git clone https://github.com/[your-org]/cardulary.git
cd cardulary
npm install
cp .env.example .env.local

# Configure environment variables
# See section 4.4 for full list

# Run database migrations
npm run db:push  # Drizzle push to Neon

# Start development server
npm run dev  # Opens at http://localhost:3000

# Run tests
npm run test        # Unit tests
npm run test:e2e    # Playwright E2E tests
```

### 12.2 Project Structure (Detailed)

```
cardulary/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── events/
│   │   │   ├── page.tsx                # Event list
│   │   │   ├── [id]/page.tsx           # Event detail/dashboard
│   │   │   ├── [id]/guests/page.tsx    # Guest management
│   │   │   ├── [id]/export/page.tsx    # Export wizard
│   │   │   └── new/page.tsx            # Create event
│   │   ├── contacts/page.tsx           # Master contact list
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── ai/
│   │   │   ├── personalize/route.ts    # Claude message generation
│   │   │   ├── validate-address/route.ts # GPT address validation
│   │   │   └── suggest-merge/route.ts  # Duplicate detection
│   │   ├── events/
│   │   │   ├── route.ts                # GET /api/events, POST /api/events
│   │   │   └── [id]/
│   │   │       ├── route.ts            # GET, PATCH, DELETE
│   │   │       ├── guests/route.ts
│   │   │       ├── send/route.ts       # Send requests
│   │   │       └── export/route.ts
│   │   ├── guests/
│   │   │   ├── import/route.ts         # CSV import
│   │   │   └── [token]/submit/route.ts # Public submission endpoint
│   │   ├── webhooks/
│   │   │   ├── resend/route.ts         # Email delivery events
│   │   │   └── twilio/route.ts         # SMS delivery events
│   │   └── cron/
│   │       ├── send-reminders/route.ts # Scheduled reminder job
│   │       └── cleanup-exports/route.ts
│   ├── submit/[token]/
│   │   ├── page.tsx                    # Public guest submission page
│   │   └── thank-you/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                        # Landing page
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── event-form.tsx
│   │   ├── guest-form.tsx
│   │   └── address-form.tsx
│   ├── layouts/
│   │   ├── dashboard-layout.tsx
│   │   └── marketing-layout.tsx
│   ├── tables/
│   │   ├── guest-list-table.tsx
│   │   └── contact-list-table.tsx
│   └── modals/
│       ├── send-request-modal.tsx
│       └── import-csv-modal.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                   # Drizzle schema
│   │   ├── queries.ts                  # Reusable queries
│   │   └── migrations/
│   ├── ai/
│   │   ├── claude.ts                   # Anthropic client wrapper
│   │   ├── openai.ts                   # OpenAI client wrapper
│   │   └── prompts.ts                  # Prompt templates
│   ├── email/
│   │   ├── resend.ts                   # Resend client
│   │   └── templates/
│   │       ├── address-request.tsx     # React Email template
│   │       └── confirmation.tsx
│   ├── sms/
│   │   └── twilio.ts                   # Twilio client
│   ├── utils/
│   │   ├── address-parser.ts
│   │   ├── token-generator.ts
│   │   └── validators.ts
│   └── constants.ts
├── public/
│   ├── images/
│   └── fonts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local (gitignored)
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

### 12.3 Key Implementation Notes

#### Database Connection (Neon + Drizzle)
```typescript
// lib/db/client.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

#### AI Client Wrappers
```typescript
// lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function personalizeMessage(params: {
  eventType: string;
  relationship: string;
  tone: string;
  context?: string;
}): Promise<string> {
  const prompt = `...[see section 4.3 for full prompt]...`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return response.content[0].text;
}
```

#### Email Sending
```typescript
// lib/email/resend.ts
import { Resend } from 'resend';
import AddressRequestEmail from './templates/address-request';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAddressRequest(params: {
  to: string;
  guestName: string;
  organizerName: string;
  eventName: string;
  submissionLink: string;
  customMessage: string;
}) {
  return await resend.emails.send({
    from: 'Cardulary <noreply@cardulary.app>',
    to: params.to,
    subject: `${params.organizerName} needs your mailing address`,
    react: AddressRequestEmail(params),
  });
}
```

#### SMS Sending
```typescript
// lib/sms/twilio.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendAddressRequestSMS(params: {
  to: string;
  message: string;
  link: string;
}) {
  const body = `${params.message}\n\n${params.link}`;

  return await client.messages.create({
    body,
    to: params.to,
    from: process.env.TWILIO_PHONE_NUMBER,
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`,
  });
}
```

---

## 13. Appendix

### A. Glossary

- **Event**: A single occasion (wedding, party, etc.) for which the user is collecting addresses
- **Guest**: An individual from whom an address is being requested for a specific event
- **Contact**: A person in the user's master database (may be a guest in multiple events)
- **Submission**: The act of a guest providing their address via the public form
- **Token**: A unique, unguessable identifier used in submission links for security
- **Reminder**: An automated follow-up message sent to guests who haven't responded
- **Export**: The process of downloading collected data in a specific format
- **Integration**: Pre-formatted export for a specific mailing service (Minted, Shutterfly, etc.)

### B. Acronyms

- **PWA**: Progressive Web App
- **CRUD**: Create, Read, Update, Delete
- **CSV**: Comma-Separated Values
- **SMS**: Short Message Service
- **API**: Application Programming Interface
- **OAuth**: Open Authorization
- **GDPR**: General Data Protection Regulation
- **TCPA**: Telephone Consumer Protection Act (U.S. SMS compliance law)
- **MAU**: Monthly Active Users
- **ARPU**: Average Revenue Per User
- **LTV**: Lifetime Value
- **CAC**: Customer Acquisition Cost
- **ARR**: Annual Recurring Revenue
- **MRR**: Monthly Recurring Revenue
- **PMF**: Product-Market Fit
- **NPS**: Net Promoter Score

### C. Open Questions (To Be Resolved Before Development)

1. **Auth Provider**: Clerk ($25/mo for 1,000 MAU) vs. NextAuth.js (free but more setup)?
   - **Recommendation**: Start with NextAuth.js to save costs, migrate to Clerk if auth becomes complex

2. **SMS Credit System**: Should we implement SMS credits to control costs, or let users pay per send?
   - **Recommendation**: Hybrid—include 50 SMS in Pro purchase, then $0.10/SMS after

3. **International Addresses**: Should MVP support international addresses beyond US/Canada?
   - **Recommendation**: Yes, but with text input only (no autocomplete). Add autocomplete for UK/Australia in V2

4. **Guest Edit Window**: 24 hours or 7 days for guests to edit their submission?
   - **Recommendation**: 24 hours for MVP (prevents abuse), add "Request to edit" button after that

5. **Branding Removal**: Should free tier show "Powered by Cardulary" on submission pages?
   - **Recommendation**: Yes, subtle footer badge. Pro tier removes it.

6. **Trial Period**: Offer 7-day free trial of Pro features, or hard paywall?
   - **Recommendation**: No trial—freemium tier is the trial. Clear upgrade prompts at feature limits.

### D. Design Assets Needed

- [ ] Logo (SVG + PNG, light/dark mode variants)
- [ ] Favicon (16x16, 32x32, 192x192, 512x512)
- [ ] Social media preview images (1200x630 for OG tags)
- [ ] Email header graphics
- [ ] Landing page hero illustration/screenshot
- [ ] Empty state illustrations (no events, no guests, etc.)
- [ ] Loading animations/spinners
- [ ] Success/error icons

### E. Legal Requirements

- [ ] Privacy Policy (GDPR/CCPA compliant)
- [ ] Terms of Service
- [ ] Cookie consent banner (if using analytics cookies)
- [ ] TCPA compliance for SMS (opt-out instructions, consent language)
- [ ] DMCA agent registration (if allowing user-generated content)
- [ ] Business entity formation (LLC recommended for liability protection)

### F. Reference Links

- **Next.js Documentation**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Neon Database**: https://neon.tech/docs
- **Vercel Deployment**: https://vercel.com/docs
- **Claude API**: https://docs.anthropic.com
- **OpenAI API**: https://platform.openai.com/docs
- **Resend Email**: https://resend.com/docs
- **Twilio SMS**: https://www.twilio.com/docs/sms
- **Google Places API**: https://developers.google.com/maps/documentation/places
- **shadcn/ui**: https://ui.shadcn.com
- **React Email**: https://react.email

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Strategy | Initial PRD creation based on user requirements and clarifying questions |

---

**End of Product Requirements Document**

Total Pages: 47
Word Count: ~18,500
Status: Ready for Development
Next Steps: Review with stakeholders → Technical feasibility validation → Sprint planning → Begin MVP development