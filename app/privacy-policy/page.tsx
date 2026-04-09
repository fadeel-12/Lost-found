import Link from "next/link";
import { Footer } from "@/components/home/Footer";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

        <section className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Introduction</h2>
            <p>
              The University of Innsbruck ("UIBK") operates the Lost and Found platform ("Lostify")
              to help students and staff report and recover lost items on campus. This Privacy Policy
              explains how we collect, use, and protect your personal data in accordance with the
              General Data Protection Regulation (GDPR) and applicable Austrian data protection law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Data We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Name and email address (upon registration)</li>
              <li>Item reports including title, description, category, location, and date</li>
              <li>Messages exchanged between users regarding lost or found items</li>
              <li>Notification preferences and read statuses</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To enable you to report lost or found items</li>
              <li>To match lost items with found items on campus</li>
              <li>To send notifications about potential matches or messages</li>
              <li>To maintain and improve the platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">4. Legal Basis</h2>
            <p>
              We process your data based on your consent (Art. 6(1)(a) GDPR) given at registration,
              and where necessary to perform the service you requested (Art. 6(1)(b) GDPR).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">5. Data Retention</h2>
            <p>
              Item reports are retained for 90 days after being marked as recovered or deleted.
              Account data is retained for as long as your account is active. You may request
              deletion of your data at any time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">6. Your Rights</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">7. Contact</h2>
            <p>
              For any privacy-related requests, contact the UIBK Data Protection Officer at{" "}
              <a href="mailto:datenschutz@uibk.ac.at" className="text-blue-600 hover:underline">
                datenschutz@uibk.ac.at
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
