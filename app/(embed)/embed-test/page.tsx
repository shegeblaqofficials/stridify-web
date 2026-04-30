import Script from "next/script";

export const metadata = {
  title: "Embed Test - Stridify",
};

export default function EmbedTestPage({
  searchParams,
}: {
  searchParams: Promise<{ sandboxId?: string }>;
}) {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-200 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Stridify Embed Popup Test</h1>
        <p className="text-slate-600">
          The popup widget should appear in the bottom-right corner. Click the
          button to open it.
        </p>
      </div>
      <PopupLoader searchParams={searchParams} />
    </main>
  );
}

async function PopupLoader({
  searchParams,
}: {
  searchParams: Promise<{ sandboxId?: string }>;
}) {
  const params = await searchParams;
  const sandboxId = params.sandboxId ?? "demo";
  return (
    <Script
      src="/embed-popup.js"
      data-stridify-sandbox-id={sandboxId}
      strategy="afterInteractive"
    />
  );
}
