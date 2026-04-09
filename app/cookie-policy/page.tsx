import Link from "next/link";
import { Footer } from "@/components/home/Footer";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 text-xl font-semibold">
            UIBK Lost and Found
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

        <section className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They
              help the site remember your preferences and improve your experience. Lostify uses
              cookies strictly necessary for the platform to function.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Cookie Name</th>
                    <th className="text-left px-4 py-2 font-semibold">Purpose</th>
                    <th className="text-left px-4 py-2 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2 font-mono">session_token</td>
                    <td className="px-4 py-2">Keeps you logged in during your session</td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">auth_token</td>
                    <td className="px-4 py-2">Authenticates your identity securely</td>
                    <td className="px-4 py-2">7 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono">preferences</td>
                    <td className="px-4 py-2">Stores your filter and display preferences</td>
                    <td className="px-4 py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">3. Strictly Necessary Cookies</h2>
            <p>
              These cookies are essential for Lostify to operate and cannot be disabled. They
              do not store personally identifiable information beyond what is required for
              authentication and session management.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">4. No Tracking or Analytics Cookies</h2>
            <p>
              Lostify does not use third-party tracking, advertising, or analytics cookies.
              We do not share cookie data with any external parties.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">5. Managing Cookies</h2>
            <p>
              You can control or delete cookies through your browser settings. Note that
              disabling strictly necessary cookies may prevent you from logging in or using
              core features of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">6. Contact</h2>
            <p>
              For questions about our cookie usage, contact us at{" "}
              <a href="mailto:lostify@uibk.ac.at" className="text-blue-600 hover:underline">
                lostify@uibk.ac.at
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
