import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, eventGuests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateGuestToken } from "@/lib/utils/token";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify event ownership
    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, params.id),
        eq(events.userId, session.user.id)
      ),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const guests = await db.query.eventGuests.findMany({
      where: eq(eventGuests.eventId, params.id),
      orderBy: (eventGuests, { desc }) => [desc(eventGuests.createdAt)],
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error("Get guests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify event ownership
    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, params.id),
        eq(events.userId, session.user.id)
      ),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { firstName, lastName, email, phone } = await req.json();

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "At least one contact method (email or phone) is required" },
        { status: 400 }
      );
    }

    // Generate unique token for submission link
    const token = generateGuestToken();

    // Create guest
    const [newGuest] = await db
      .insert(eventGuests)
      .values({
        eventId: params.id,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        token,
        status: "not_sent",
      })
      .returning();

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
