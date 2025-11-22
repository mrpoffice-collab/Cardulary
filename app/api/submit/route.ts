import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventGuests, addressSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { token, addressLine1, addressLine2, city, state, zip, country } =
      await req.json();

    // Validate input
    if (!token || !addressLine1 || !city || !state || !zip) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find guest by token
    const guest = await db.query.eventGuests.findFirst({
      where: eq(eventGuests.token, token),
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Invalid submission link" },
        { status: 404 }
      );
    }

    // Get IP address for abuse prevention
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Mark any existing submissions as not current
    await db
      .update(addressSubmissions)
      .set({ isCurrent: false })
      .where(eq(addressSubmissions.eventGuestId, guest.id));

    // Create new submission
    const [submission] = await db
      .insert(addressSubmissions)
      .values({
        eventGuestId: guest.id,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        zip,
        country: country || "US",
        ipAddress: ip,
        isCurrent: true,
      })
      .returning();

    // Update guest status to completed
    await db
      .update(eventGuests)
      .set({
        status: "completed",
        submittedAt: new Date(),
      })
      .where(eq(eventGuests.id, guest.id));

    return NextResponse.json(
      { message: "Address submitted successfully", submission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit address error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
