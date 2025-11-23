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
      { error: "Unable to retrieve guests. Please try again later." },
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

    // Validate and sanitize names
    const { validateName, validateEmail, validatePhone } = await import("@/lib/utils/validation");

    const firstNameValidation = validateName(firstName, "First name");
    if (!firstNameValidation.valid) {
      return NextResponse.json(
        { error: firstNameValidation.error },
        { status: 400 }
      );
    }

    const lastNameValidation = validateName(lastName, "Last name");
    if (!lastNameValidation.valid) {
      return NextResponse.json(
        { error: lastNameValidation.error },
        { status: 400 }
      );
    }

    // Validate contact info
    let validatedEmail = null;
    let validatedPhone = null;

    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return NextResponse.json(
          { error: emailValidation.error },
          { status: 400 }
        );
      }
      validatedEmail = emailValidation.email;
    }

    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: phoneValidation.error },
          { status: 400 }
        );
      }
      validatedPhone = phoneValidation.phone;
    }

    if (!validatedEmail && !validatedPhone) {
      return NextResponse.json(
        { error: "At least one contact method (email or phone) is required" },
        { status: 400 }
      );
    }

    // Generate unique token for submission link
    const token = generateGuestToken();

    // Create guest with validated data
    const [newGuest] = await db
      .insert(eventGuests)
      .values({
        eventId: params.id,
        firstName: firstNameValidation.name!,
        lastName: lastNameValidation.name!,
        email: validatedEmail,
        phone: validatedPhone,
        token,
        status: "not_sent",
      })
      .returning();

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json(
      { error: "Unable to create guest. Please try again later." },
      { status: 500 }
    );
  }
}
