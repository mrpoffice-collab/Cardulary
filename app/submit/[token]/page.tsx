import { db } from "@/lib/db";
import { eventGuests, events, addressSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import SubmissionForm from "./submission-form";

export default async function SubmissionPage({
  params,
}: {
  params: { token: string };
}) {
  // Find guest by token
  const guest = await db.query.eventGuests.findFirst({
    where: eq(eventGuests.token, params.token),
  });

  if (!guest) {
    notFound();
  }

  // Get event details
  const event = await db.query.events.findFirst({
    where: eq(events.id, guest.eventId),
  });

  if (!event) {
    notFound();
  }

  // Check if already submitted
  const existingSubmission = await db.query.addressSubmissions.findFirst({
    where: eq(addressSubmissions.eventGuestId, guest.id),
    orderBy: (addressSubmissions, { desc }) => [desc(addressSubmissions.submittedAt)],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.name}
            </h1>
            <p className="text-gray-600">
              Hi {guest.firstName}! Please share your mailing address below.
            </p>
            {event.customMessage && (
              <p className="mt-4 text-gray-700 bg-blue-50 p-4 rounded-lg">
                {event.customMessage}
              </p>
            )}
          </div>

          {/* Submission Form */}
          <SubmissionForm
            token={params.token}
            guestName={`${guest.firstName} ${guest.lastName}`}
            existingSubmission={existingSubmission}
          />

          {/* Privacy Notice */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              🔒 Your address will only be used for {event.name}.
              <br />
              We will never spam you or share your information.
            </p>
          </div>

          {/* Branding */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>Powered by <span className="font-semibold text-blue-600">Cardulary</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
