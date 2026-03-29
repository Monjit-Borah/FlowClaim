export default function LandingPage() {
  return (
    <main className="fixed inset-0 z-20 h-screen w-screen overflow-hidden bg-black">
      <iframe
        title="ClaimFlow AI landing page"
        src="/claimflow.html"
        className="h-full w-full border-0"
      />
    </main>
  );
}
