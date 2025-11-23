import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventGuests, addressSubmissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Verify API key from Whispering Art app
function verifyApiKey(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key");
  return apiKey === process.env.CARDULARY_API_KEY;
}

// GET /api/external/addresses?eventId=xxx&userId=xxx
// Fetch all addresses for a specific event
export async function GET(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");

  if (!eventId || !userId) {
    return NextResponse.json(
      { error: "eventId and userId required" },
      { status: 400 }
    );
  }

  try {
    // Verify event ownership
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.userId, userId)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get all completed guests
    const guests = await db.query.eventGuests.findMany({
      where: and(
        eq(eventGuests.eventId, eventId),
        eq(eventGuests.status, "completed")
      ),
    });

    // Get current addresses for these guests
    const addresses = await Promise.all(
      guests.map(async (guest) => {
        const submission = await db.query.addressSubmissions.findFirst({
          where: and(
            eq(addressSubmissions.eventGuestId, guest.id),
            eq(addressSubmissions.isCurrent, true)
          ),
        });

        if (!submission) return null;

        return {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          fullName: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
          phone: guest.phone,
          address: {
            line1: submission.addressLine1,
            line2: submission.addressLine2,
            city: submission.city,
            state: submission.state,
            zip: submission.zip,
            country: submission.country,
          },
          submittedAt: guest.submittedAt,
        };
      })
    );

    const validAddresses = addresses.filter((a) => a !== null);

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        eventType: event.eventType,
        eventDate: event.eventDate,
      },
      addresses: validAddresses,
      total: validAddresses.length,
    });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/external/addresses
// Get all events for a user
export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const userEvents = await db.query.events.findMany({
      where: eq(events.userId, userId),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    // Get guest counts for each event
    const eventsWithCounts = await Promise.all(
      userEvents.map(async (event) => {
        const guests = await db.query.eventGuests.findMany({
          where: eq(eventGuests.eventId, event.id),
        });

        const completed = guests.filter((g) => g.status === "completed").length;

        return {
          id: event.id,
          name: event.name,
          eventType: event.eventType,
          eventDate: event.eventDate,
          createdAt: event.createdAt,
          totalGuests: guests.length,
          completedAddresses: completed,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCounts });
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
