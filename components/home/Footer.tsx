"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/TranslationContext";

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.497 5.783 2.226 7.15 2.163 8.416 2.105 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.856.601 3.698 1.942 5.039 1.341 1.341 3.183 1.857 5.039 1.942C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 1.856-.085 3.698-.601 5.039-1.942 1.341-1.341 1.857-3.183 1.942-5.039.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.085-1.857-.601-3.699-1.942-5.04C20.646.673 18.804.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/uibk.ac.at", icon: <FacebookIcon /> },
  { label: "Instagram", href: "https://www.instagram.com/uniinnsbruck", icon: <InstagramIcon /> },
  { label: "Twitter / X", href: "https://twitter.com/uniinnsbruck", icon: <TwitterIcon /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/university-of-innsbruck", icon: <LinkedInIcon /> },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-blue-600 font-semibold text-lg mb-3">
              {t.header.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t.footer.description}
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.uibk.ac.at"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  {t.footer.university}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">{t.footer.policies}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-blue-600 transition-colors">
                  {t.footer.termsOfUse}
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-blue-600 transition-colors">
                  {t.footer.cookiePolicy}
                </Link>
              </li>
              <li>
                <Link href="/data-protection" className="hover:text-blue-600 transition-colors">
                  {t.footer.dataProtection}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">{t.footer.contact}</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>University of Innsbruck</li>
              <li>Innrain 52, 6020 Innsbruck</li>
              <li>Austria</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-400">
          {t.footer.rights.replace("{year}", String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
