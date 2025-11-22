import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const userEvents = await db.query.events.findMany({
    where: eq(events.userId, session.user.id),
    orderBy: (events, { desc }) => [desc(events.createdAt)],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Events</h1>
          <p className="text-gray-600 mt-1">Manage address collection for all your events</p>
        </div>
        <Link href="/events/new">
          <Button size="lg">Create New Event</Button>
        </Link>
      </div>

      {userEvents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="text-6xl">📮</div>
            <CardTitle>No events yet</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Create your first event to start collecting mailing addresses from friends and family
            </CardDescription>
            <Link href="/events/new">
              <Button className="mt-4">Create Your First Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <CardDescription className="capitalize mt-1">
                        {event.eventType || "Event"}
                      </CardDescription>
                    </div>
                    <div className="text-2xl">
                      {event.eventType === "wedding" && "💒"}
                      {event.eventType === "graduation" && "🎓"}
                      {event.eventType === "birthday" && "🎂"}
                      {event.eventType === "reunion" && "👥"}
                      {event.eventType === "holiday_cards" && "🎄"}
                      {!event.eventType && "📅"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {event.eventDate && (
                      <div className="text-gray-600">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-gray-600">
                      Created {new Date(event.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
