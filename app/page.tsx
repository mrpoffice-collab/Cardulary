import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">Cardulary</div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Collect Mailing Addresses in Minutes, Not Weeks
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform the chaotic process of collecting guest addresses into a streamlined,
            AI-assisted workflow. Perfect for weddings, graduations, parties, and holiday cards.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Free
            </Link>
            <Link
              href="#features"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">✉️</div>
            <h3 className="text-xl font-semibold mb-2">Email & Share Links</h3>
            <p className="text-gray-600">
              Send personalized email requests or share links via any messaging app
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Personalization</h3>
            <p className="text-gray-600">
              Generate warm, natural messages that feel human, not robotic
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Automated Reminders</h3>
            <p className="text-gray-600">
              Smart follow-ups sent automatically to guests who haven't responded
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Easy Export</h3>
            <p className="text-gray-600">
              Export to Minted, Shutterfly, or any mailing service in one click
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mobile-Friendly</h3>
            <p className="text-gray-600">
              Guests can submit addresses in under 60 seconds on any device
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-2">Contact Database</h3>
            <p className="text-gray-600">
              Save addresses permanently and reuse for future events
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-blue-600 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event organizers who've simplified their address collection
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold inline-block hover:bg-gray-100 transition"
          >
            Create Your Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 Cardulary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
