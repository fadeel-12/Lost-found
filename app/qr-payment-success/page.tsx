"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No session ID found.");
      return;
    }

    fetch(`/api/stripe/confirm-payment?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setStatus("error");
        } else {
          setCount(data.count ?? 0);
          setStatus("success");
        }
      })
      .catch(() => {
        setErrorMsg("Something went wrong. Please contact support.");
        setStatus("error");
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        <h1 className="text-2xl font-semibold text-gray-800">Activating your QR tags…</h1>
        <p className="text-gray-500">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-semibold text-gray-800">Payment Issue</h1>
        <p className="text-gray-500">{errorMsg}</p>
        <Button onClick={() => router.push("/?qr_tags=open")}>Back to QR Tags</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-semibold text-gray-800">
        {count} QR {count === 1 ? "Tag" : "Tags"} Activated!
      </h1>
      <p className="text-gray-600">
        Your QR {count === 1 ? "tag is" : "tags are"} now active and ready to download.
      </p>
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border rounded-lg px-4 py-2">
        <QrCode className="h-4 w-4" />
        <span>Print them and attach to your valuables so finders can notify you anonymously.</span>
      </div>
      <Button className="mt-2 gap-2" onClick={() => router.push("/?qr_tags=open")}>
        <QrCode className="h-4 w-4" />
        View & Download My QR Tags
      </Button>
    </div>
  );
}

export default function QRPaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-10 max-w-md w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            <p className="text-gray-500">Loading…</p>
          </div>
        }>
          <PaymentSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
