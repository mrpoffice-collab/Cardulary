import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password"), // For credential-based auth
  name: text("name"),
  phone: text("phone"),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  eventType: text("event_type"), // wedding, graduation, birthday, reunion, holiday_cards, other
  eventDate: date("event_date"),
  customMessage: text("custom_message"),
  activeFields: jsonb("active_fields"), // {nickname: true, rsvp: true, custom_fields: [...]}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Master contacts table
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country").default("US"),
  tags: text("tags").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event-specific guest instances
export const eventGuests = pgTable("event_guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  token: text("token").notNull().unique(), // Unique submission link token
  status: text("status").default("not_sent").notNull(), // not_sent, pending, completed, bounced
  requestSentAt: timestamp("request_sent_at"),
  requestMethod: text("request_method"), // email, sms
  submittedAt: timestamp("submitted_at"),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),
  reminderCount: integer("reminder_count").default(0).notNull(),
  customData: jsonb("custom_data"), // {nickname: "Mike", rsvp: "yes", custom_field_1: "..."}
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Address submissions (separate table for edit history)
export const addressSubmissions = pgTable("address_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventGuestId: uuid("event_guest_id").notNull().references(() => eventGuests.id, { onDelete: "cascade" }),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").default("US").notNull(),
  customFields: jsonb("custom_fields"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  ipAddress: text("ip_address"), // For abuse prevention
  isCurrent: boolean("is_current").default(true).notNull(), // Track edit history
});

// Message templates
export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  templateText: text("template_text").notNull(),
  templateType: text("template_type"), // initial, reminder
  tone: text("tone"), // warm_casual, polite_formal, playful
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reminder schedules
export const reminderSchedules = pgTable("reminder_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  intervals: integer("intervals").array(), // [3, 7, 14] days after initial send
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Delivery tracking
export const deliveryEvents = pgTable("delivery_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventGuestId: uuid("event_guest_id").notNull().references(() => eventGuests.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // sent, delivered, opened, clicked, bounced, failed
  channel: text("channel").notNull(), // email, sms
  metadata: jsonb("metadata"), // Provider-specific data
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

// Export history
export const exports = pgTable("exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  format: text("format").notNull(), // csv, xlsx, pdf
  filterCriteria: jsonb("filter_criteria"),
  fileUrl: text("file_url"),
  exportedAt: timestamp("exported_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Cleanup old files
});

// Accounts table for NextAuth
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// Sessions table for NextAuth
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// Verification tokens for NextAuth
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  contacts: many(contacts),
  messageTemplates: many(messageTemplates),
  exports: many(exports),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  eventGuests: many(eventGuests),
  reminderSchedules: many(reminderSchedules),
  exports: many(exports),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  eventGuests: many(eventGuests),
}));

export const eventGuestsRelations = relations(eventGuests, ({ one, many }) => ({
  event: one(events, {
    fields: [eventGuests.eventId],
    references: [events.id],
  }),
  contact: one(contacts, {
    fields: [eventGuests.contactId],
    references: [contacts.id],
  }),
  addressSubmissions: many(addressSubmissions),
  deliveryEvents: many(deliveryEvents),
}));

export const addressSubmissionsRelations = relations(addressSubmissions, ({ one }) => ({
  eventGuest: one(eventGuests, {
    fields: [addressSubmissions.eventGuestId],
    references: [eventGuests.id],
  }),
}));
