import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <Card className="max-w-md text-center py-12">
        <CardContent className="space-y-4">
          <div className="text-6xl">❌</div>
          <CardTitle className="text-2xl">Link Not Found</CardTitle>
          <p className="text-gray-600">
            This submission link is invalid or has expired. Please contact the event organizer for a new link.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Go to Homepage
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
