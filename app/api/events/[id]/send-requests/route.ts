import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, eventGuests, deliveryEvents } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendAddressRequestEmail } from "@/lib/email/resend";
import { getSubmissionUrl } from "@/lib/utils/token";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify event ownership
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.userId, session.user.id)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { guestIds, message } = await req.json();

    if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json(
        { error: "No guests selected" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch selected guests
    const guests = await db.query.eventGuests.findMany({
      where: and(
        eq(eventGuests.eventId, id),
        inArray(eventGuests.id, guestIds)
      ),
    });

    if (guests.length === 0) {
      return NextResponse.json({ error: "No valid guests found" }, { status: 404 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send email requests to each guest
    for (const guest of guests) {
      const submissionLink = getSubmissionUrl(guest.token);
      const personalizedMessage = message.replace("{firstName}", guest.firstName);

      try {
        if (!guest.email) {
          results.failed++;
          results.errors.push(`${guest.firstName} ${guest.lastName}: No email address`);
          continue;
        }

        const emailResult = await sendAddressRequestEmail({
          to: guest.email,
          guestName: `${guest.firstName} ${guest.lastName}`,
          organizerName: session.user.name || "The organizer",
          eventName: event.name,
          submissionLink,
          customMessage: personalizedMessage,
        });

        if (emailResult.success) {
          results.success++;

          // Update guest status
          await db
            .update(eventGuests)
            .set({
              status: "pending",
              requestSentAt: new Date(),
              requestMethod: "email",
            })
            .where(eq(eventGuests.id, guest.id));

          // Log delivery event
          await db.insert(deliveryEvents).values({
            eventGuestId: guest.id,
            eventType: "sent",
            channel: "email",
            metadata: { provider: "resend" },
          });
        } else {
          results.failed++;
          results.errors.push(`${guest.firstName} ${guest.lastName}: Email failed`);
        }
      } catch (error) {
        console.error(`Error sending to ${guest.firstName} ${guest.lastName}:`, error);
        results.failed++;
        results.errors.push(`${guest.firstName} ${guest.lastName}: Unexpected error`);
      }
    }

    return NextResponse.json({
      message: `Sent ${results.success} requests, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error("Send requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
