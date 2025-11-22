import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, eventGuests, addressSubmissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  exportToCSV,
  exportToExcel,
  exportToMinted,
  exportToShutterfly,
  exportToVistaprint,
  exportForAveryLabels,
  getExportFilename,
  type GuestExportData,
} from "@/lib/export/formats";

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
      where: and(eq(events.id, params.id), eq(events.userId, session.user.id)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get format from query params
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const statusFilter = searchParams.get("status"); // optional: completed, pending, all

    // Fetch guests with their submissions
    const guests = await db.query.eventGuests.findMany({
      where: eq(eventGuests.eventId, params.id),
      with: {
        addressSubmissions: {
          where: eq(addressSubmissions.isCurrent, true),
          limit: 1,
        },
      },
    });

    // Filter by status if specified
    let filteredGuests = guests;
    if (statusFilter && statusFilter !== "all") {
      filteredGuests = guests.filter((g) => g.status === statusFilter);
    }

    // Transform to export format
    const exportData: GuestExportData[] = filteredGuests.map((guest) => {
      const submission = guest.addressSubmissions?.[0];
      return {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        addressLine1: submission?.addressLine1 || null,
        addressLine2: submission?.addressLine2 || null,
        city: submission?.city || null,
        state: submission?.state || null,
        zip: submission?.zip || null,
        country: submission?.country || null,
        status: guest.status,
        submittedAt: guest.submittedAt,
      };
    });

    // Generate export based on format
    let fileContent: string | Buffer;
    let contentType: string;

    switch (format) {
      case "excel":
        fileContent = exportToExcel(exportData);
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      case "minted":
        fileContent = exportToMinted(exportData);
        contentType = "text/csv";
        break;
      case "shutterfly":
        fileContent = exportToShutterfly(exportData);
        contentType = "text/csv";
        break;
      case "vistaprint":
        fileContent = exportToVistaprint(exportData);
        contentType = "text/csv";
        break;
      case "avery":
        fileContent = exportForAveryLabels(exportData);
        contentType = "text/csv";
        break;
      case "csv":
      default:
        fileContent = exportToCSV(exportData);
        contentType = "text/csv";
        break;
    }

    const filename = getExportFilename(event.name, format);

    // Log export event
    await db.insert(exports).values({
      eventId: params.id,
      userId: session.user.id,
      format,
      filterCriteria: { status: statusFilter || "all" },
      exportedAt: new Date(),
    });

    // Convert Buffer to Uint8Array for Response compatibility
    const responseBody = typeof fileContent === 'string'
      ? fileContent
      : new Uint8Array(fileContent);

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
