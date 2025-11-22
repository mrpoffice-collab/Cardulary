import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

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
      { error: "Internal server error" },
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

    if (!name) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        userId: session.user.id,
        name,
        eventType: eventType || null,
        eventDate: eventDate || null,
        customMessage: customMessage || null,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
