export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="mx-auto w-12 h-12 rounded-xl bg-hema/10 flex items-center justify-center">
          <span className="w-5 h-5 rounded border-2 border-hema" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Two-factor authentication</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <form action="/api/auth/verify-totp" method="post" className="space-y-4">
          <input
            name="code"
            inputMode="numeric"
            maxLength={6}
            className="w-full text-center tracking-[0.5em] text-lg rounded-md border border-hema px-3 py-2"
            placeholder="••••••"
          />
          <button className="w-full rounded-md bg-petrol py-2.5 text-white text-sm font-semibold">
            Verify &amp; continue
          </button>
        </form>
        <p className="text-xs text-neutral-500">
          Authenticator only — no SMS, nothing to intercept.
        </p>
      </div>
    </main>
  );
}
