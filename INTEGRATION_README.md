# Cardulary ↔️ Whispering Art Integration

This document explains how Cardulary (address collection) integrates with Whispering Art (greeting cards).

## Overview

**Cardulary** collects mailing addresses from event guests → **Whispering Art** uses those addresses to send greeting cards.

## Setup

### 1. Generate API Keys

Generate secure API keys for both apps:

```bash
# Generate Cardulary API key
node -e "console.log('cardulary_sk_live_' + require('crypto').randomBytes(32).toString('hex'))"

# Generate Whispering Art API key
node -e "console.log('whispering_sk_live_' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure Cardulary Environment Variables

Add to `C:\Users\mrpof\APPS Homemade\cardulary\.env.local`:

```env
# API key for Whispering Art to call Cardulary
CARDULARY_API_KEY=cardulary_sk_live_abc123...

# Optional: If Cardulary needs to call Whispering Art back
WHISPERING_ART_API_URL=https://your-card-app.com/api
WHISPERING_ART_API_KEY=whispering_sk_live_xyz789...
```

### 3. Configure Whispering Art Environment Variables

Add to `C:\Users\mrpof\APPS Homemade\whispering-art\.env.local`:

```env
# Cardulary integration
CARDULARY_API_URL=https://cardulary.com/api/external
CARDULARY_API_KEY=cardulary_sk_live_abc123...
```

### 4. Initialize Database Tables

Run Whispering Art to create the `recipients` table:

```bash
cd "C:\Users\mrpof\APPS Homemade\whispering-art"
npm run dev
```

The table will be created automatically on first run.

## How It Works

### User Flow

1. **Cardulary**: User creates an event and collects addresses from guests
2. **Whispering Art**: User clicks "Import from Cardulary" button
3. **Selection**: User selects which event to import addresses from
4. **Import**: Addresses are imported into Whispering Art's `recipients` table
5. **Usage**: When creating a card, user can select from saved recipients

### API Endpoints

#### Cardulary Exposes:

**GET `/api/external/addresses?eventId=xxx&userId=xxx`**
- Returns all completed addresses for an event
- Requires `X-API-Key` header with `CARDULARY_API_KEY`

**POST `/api/external/addresses`**
- Body: `{ userId }`
- Returns all events for a user with address counts
- Requires `X-API-Key` header

#### Whispering Art Provides:

**GET `/api/import/cardulary?userId=xxx`**
- Fetches list of events from Cardulary
- Returns events with completed address counts

**POST `/api/import/cardulary`**
- Body: `{ userId, eventId }`
- Imports addresses from specified Cardulary event
- Saves to `recipients` table

**GET `/api/recipients?userId=xxx`**
- Returns all saved recipients for user

## Database Schema

### Whispering Art: `recipients` table

```sql
CREATE TABLE recipients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  source TEXT NOT NULL DEFAULT 'manual',
  source_event_id TEXT,
  source_event_name TEXT,
  imported_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Security

- All API requests require authentication via `X-API-Key` header
- API keys are stored as environment variables (never committed to git)
- Both apps validate requests before processing
- Rate limiting is applied to prevent abuse

## Testing

### Test the Integration

1. **In Cardulary:**
   - Create an event
   - Add guests and collect some addresses

2. **In Whispering Art:**
   - Go to checkout step
   - Click "Import from Cardulary"
   - Select your event
   - Click "Import Addresses"
   - Addresses should appear in recipient selector

### Verify Database

```bash
# Check recipients table in Whispering Art
psql $DATABASE_URL -c "SELECT * FROM recipients WHERE source = 'cardulary';"
```

## Troubleshooting

**"Cardulary integration not configured"**
- Check that `CARDULARY_API_URL` and `CARDULARY_API_KEY` are set in Whispering Art's .env.local

**"Unauthorized" error**
- Verify API keys match between apps
- Check that `X-API-Key` header is being sent

**"No events found"**
- Ensure events exist in Cardulary with completed addresses
- Check that `userId` matches between apps

**Addresses not showing after import**
- Check browser console for errors
- Verify database insert with SQL query above
- Try refreshing the page

## Production Deployment

### Environment Variables

**Cardulary (Vercel):**
```
CARDULARY_API_KEY=<production-key>
```

**Whispering Art (Vercel):**
```
CARDULARY_API_URL=https://cardulary.com/api/external
CARDULARY_API_KEY=<same-production-key-as-cardulary>
```

### Security Checklist

- [ ] API keys are different for dev and production
- [ ] Keys are at least 64 characters long
- [ ] Keys are stored only in environment variables
- [ ] HTTPS is enforced in production
- [ ] Rate limiting is enabled
- [ ] Error messages don't leak sensitive info

## Future Enhancements

- [ ] Add webhook to notify Whispering Art when new addresses are added
- [ ] Bulk card sending (select multiple recipients at once)
- [ ] Sync updates when addresses change in Cardulary
- [ ] Add user authentication to both apps (currently using temp userId)
- [ ] Track which cards were sent to which recipients
