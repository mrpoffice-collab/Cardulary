import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              Cardulary
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Events
              </Link>
              <Link
                href="/contacts"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Contacts
              </Link>
              <Link
                href="/settings"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Settings
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{session.user?.name}</div>
                <Link
                  href="/api/auth/signout"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
