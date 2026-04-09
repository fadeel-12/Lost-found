import Link from "next/link";
import { Footer } from "@/components/home/Footer";

export default function DataProtectionPage() {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Protection</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

        <section className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Data Controller</h2>
            <p>
              The data controller for Lostify is the University of Innsbruck, Innrain 52,
              6020 Innsbruck, Austria. The university processes your personal data in compliance
              with the EU General Data Protection Regulation (GDPR) and the Austrian Data
              Protection Act (DSG).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Data Protection Officer</h2>
            <p>
              The University of Innsbruck has appointed a Data Protection Officer (DPO) who can
              be reached at:
            </p>
            <address className="mt-2 not-italic space-y-1">
              <p>Data Protection Officer</p>
              <p>University of Innsbruck</p>
              <p>Innrain 52, 6020 Innsbruck, Austria</p>
              <p>
                Email:{" "}
                <a href="mailto:datenschutz@uibk.ac.at" className="text-blue-600 hover:underline">
                  datenschutz@uibk.ac.at
                </a>
              </p>
            </address>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">3. Purpose and Legal Basis of Processing</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-medium text-gray-700">Account management</span> — based on
                your consent (Art. 6(1)(a) GDPR)
              </li>
              <li>
                <span className="font-medium text-gray-700">Item reporting and matching</span> — necessary
                to provide the service (Art. 6(1)(b) GDPR)
              </li>
              <li>
                <span className="font-medium text-gray-700">Security and fraud prevention</span> — legitimate
                interest (Art. 6(1)(f) GDPR)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal data against unauthorized access, alteration, disclosure, or destruction.
              These include encrypted data transmission (HTTPS), access controls, and regular
              security reviews.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">5. Data Sharing</h2>
            <p>
              Your personal data is not sold or shared with third parties for commercial purposes.
              Data may be shared with:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>University IT infrastructure providers bound by data processing agreements</li>
              <li>Authorities, if required by law</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">6. International Transfers</h2>
            <p>
              Your data is stored and processed within the European Economic Area (EEA). We do
              not transfer personal data to countries outside the EEA without appropriate
              safeguards in place.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">7. Your Rights Under GDPR</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Right of access (Art. 15 GDPR)</li>
              <li>Right to rectification (Art. 16 GDPR)</li>
              <li>Right to erasure / "right to be forgotten" (Art. 17 GDPR)</li>
              <li>Right to restriction of processing (Art. 18 GDPR)</li>
              <li>Right to data portability (Art. 20 GDPR)</li>
              <li>Right to object (Art. 21 GDPR)</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact our DPO at{" "}
              <a href="mailto:datenschutz@uibk.ac.at" className="text-blue-600 hover:underline">
                datenschutz@uibk.ac.at
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">8. Right to Lodge a Complaint</h2>
            <p>
              If you believe your data is being processed unlawfully, you have the right to lodge
              a complaint with the Austrian Data Protection Authority (Datenschutzbehörde):
            </p>
            <address className="mt-2 not-italic space-y-1">
              <p>Österreichische Datenschutzbehörde</p>
              <p>Barichgasse 40-42, 1030 Vienna, Austria</p>
              <p>
                Website:{" "}
                <a
                  href="https://www.dsb.gv.at"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.dsb.gv.at
                </a>
              </p>
            </address>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
