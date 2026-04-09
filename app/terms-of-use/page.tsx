import Link from "next/link";
import { Footer } from "@/components/home/Footer";

export default function TermsOfUsePage() {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

        <section className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the UIBK Lost and Found platform ("Lostify"), you agree to
              be bound by these Terms of Use. If you do not agree, please do not use the platform.
              Use of Lostify is limited to current students, faculty, and staff of the University
              of Innsbruck.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Eligibility</h2>
            <p>
              You must be a registered member of the University of Innsbruck community to create
              an account and report items. By registering, you confirm that the information you
              provide is accurate and up to date.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">3. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Submit false, misleading, or fraudulent item reports</li>
              <li>Use the platform for commercial purposes</li>
              <li>Harass or send unsolicited messages to other users</li>
              <li>Attempt to gain unauthorized access to the platform or other users' accounts</li>
              <li>Upload harmful, offensive, or illegal content</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">4. Item Reports</h2>
            <p>
              When reporting a lost or found item, you are responsible for providing accurate
              information. UIBK does not guarantee the recovery of any item and is not liable
              for any loss arising from use of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">5. Intellectual Property</h2>
            <p>
              All content, design, and functionality of Lostify is owned by the University of
              Innsbruck. You may not reproduce, distribute, or modify any part of the platform
              without prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">6. Termination</h2>
            <p>
              UIBK reserves the right to suspend or terminate your account at any time if you
              violate these Terms of Use or misuse the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">7. Changes to Terms</h2>
            <p>
              We may update these Terms of Use from time to time. Continued use of Lostify after
              changes are posted constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">8. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
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
