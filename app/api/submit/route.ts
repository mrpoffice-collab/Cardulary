import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventGuests, addressSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateAddress } from "@/lib/utils/validation";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(req, RATE_LIMITS.submit);
  if (!rateLimitResult.success) {
    return rateLimitResponse(
      rateLimitResult.limit,
      rateLimitResult.remaining,
      rateLimitResult.reset
    );
  }

  try {
    const { token, addressLine1, addressLine2, city, state, zip, country } =
      await req.json();

    // Validate token
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid submission link" },
        { status: 400 }
      );
    }

    // Validate and sanitize address
    const addressValidation = validateAddress({
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      country,
    });

    if (!addressValidation.valid) {
      return NextResponse.json(
        { error: addressValidation.error },
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
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Mark any existing submissions as not current
    await db
      .update(addressSubmissions)
      .set({ isCurrent: false })
      .where(eq(addressSubmissions.eventGuestId, guest.id));

    // Create new submission with sanitized data
    const sanitized = addressValidation.address!;
    const [submission] = await db
      .insert(addressSubmissions)
      .values({
        eventGuestId: guest.id,
        addressLine1: sanitized.addressLine1,
        addressLine2: sanitized.addressLine2 || null,
        city: sanitized.city,
        state: sanitized.state,
        zip: sanitized.zip,
        country: sanitized.country,
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
      { error: "Unable to submit address. Please try again later." },
      { status: 500 }
    );
  }
}
