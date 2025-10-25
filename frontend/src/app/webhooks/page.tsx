"use client";

import { useState } from "react";
import { triggerPaymentWebhook } from "@/lib/api";

export default function WebhooksPage() {
  const [payload, setPayload] = useState(
    JSON.stringify(
      {
        tx_ref: "TX123",
        status: "success",
        amount: "45000.00",
        provider: "mpesa",
      },
      null,
      2,
    ),
  );
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setResponse(null);
    setError(null);
    try {
      const parsed = JSON.parse(payload);
      const data = await triggerPaymentWebhook(parsed);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid payload or webhook error.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Webhooks
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Test payment webhook endpoint
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Send arbitrary JSON payloads to <code>/api/webhooks/payments/</code>{" "}
          to simulate callbacks from PSPs or other back-office systems.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[2fr_1fr]"
      >
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">
            JSON payload
          </label>
          <textarea
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            rows={16}
            className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm shadow-inner focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending ? "Sending..." : "Send webhook"}
          </button>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">
            Response
          </label>
          <div className="h-full rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-600">
            {error && (
              <div className="text-red-600">
                Error:
                <pre>{error}</pre>
              </div>
            )}
            {response && (
              <pre className="whitespace-pre-wrap">{response}</pre>
            )}
            {!error && !response && (
              <p className="text-slate-400">Responses will appear here.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
