import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, eventGuests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddGuestButton from "@/components/forms/add-guest-button";
import SendRequestDialog from "@/components/forms/send-request-dialog";
import ExportDialog from "@/components/forms/export-dialog";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch event
  const event = await db.query.events.findFirst({
    where: and(
      eq(events.id, params.id),
      eq(events.userId, session.user.id)
    ),
  });

  if (!event) {
    notFound();
  }

  // Fetch guests for this event
  const guests = await db.query.eventGuests.findMany({
    where: eq(eventGuests.eventId, params.id),
    orderBy: (eventGuests, { desc }) => [desc(eventGuests.createdAt)],
  });

  const stats = {
    total: guests.length,
    completed: guests.filter((g) => g.status === "completed").length,
    pending: guests.filter((g) => g.status === "pending").length,
    notSent: guests.filter((g) => g.status === "not_sent").length,
  };

  const responseRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Back to Events
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <p className="text-gray-600 mt-1 capitalize">
              {event.eventType || "Event"}
              {event.eventDate && ` • ${new Date(event.eventDate).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex gap-2">
            <AddGuestButton eventId={event.id} />
            <ExportDialog
              eventId={event.id}
              eventName={event.name}
              completedCount={stats.completed}
              totalCount={stats.total}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Guests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Response Rate</CardDescription>
            <CardTitle className="text-3xl">{responseRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Guest List */}
      <Card>
        <CardHeader>
          <CardTitle>Guest List</CardTitle>
          <CardDescription>Manage your guests and track their responses</CardDescription>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">No guests yet</h3>
              <p className="text-gray-600 mb-4">
                Add guests manually or import from CSV to get started
              </p>
              <AddGuestButton eventId={event.id} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Last Updated</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {guest.email || guest.phone || "—"}
                      </td>
                      <td className="py-4">
                        {guest.status === "not_sent" && (
                          <Badge variant="gray">Not Sent</Badge>
                        )}
                        {guest.status === "pending" && (
                          <Badge variant="warning">Pending</Badge>
                        )}
                        {guest.status === "completed" && (
                          <Badge variant="success">Completed</Badge>
                        )}
                        {guest.status === "bounced" && (
                          <Badge variant="destructive">Bounced</Badge>
                        )}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {new Date(guest.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <SendRequestDialog
                          eventId={event.id}
                          guestId={guest.id}
                          guestName={`${guest.firstName} ${guest.lastName}`}
                          guestEmail={guest.email}
                          guestPhone={guest.phone}
                          eventName={event.name}
                          organizerName={session.user?.name || "The organizer"}
                          eventType={event.eventType || "event"}
                          guestToken={guest.token}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
