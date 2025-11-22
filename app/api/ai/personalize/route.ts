import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { personalizeMessage } from "@/lib/ai/claude";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      eventName,
      eventType,
      guestFirstName,
      relationship,
      tone,
      context,
      organizerName,
    } = await req.json();

    if (!eventName || !guestFirstName || !organizerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await personalizeMessage({
      eventName,
      eventType,
      guestFirstName,
      relationship,
      tone,
      context,
      organizerName,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("AI personalization error:", error);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 }
    );
  }
}
