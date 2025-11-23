import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { validateEventData } from "@/lib/utils/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEvents = await db.query.events.findMany({
      where: (events, { eq }) => eq(events.userId, session.user.id),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    return NextResponse.json(userEvents);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve events. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, eventType, eventDate, customMessage } = await req.json();

    // Validate and sanitize event data
    const validation = validateEventData({ name, eventType, customMessage });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        userId: session.user.id,
        name: validation.data!.name,
        eventType: validation.data!.eventType || null,
        eventDate: eventDate || null,
        customMessage: validation.data!.customMessage || null,
        activeFields: {
          nickname: false,
          rsvp: false,
          giftReceived: false,
          customFields: [],
        },
      })
      .returning();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Unable to create event. Please try again later." },
      { status: 500 }
    );
  }
}
