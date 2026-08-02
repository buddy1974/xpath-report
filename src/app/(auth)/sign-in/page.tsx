export default function SignInPage() {
  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <section className="hidden md:flex flex-col justify-between bg-petrol-deep text-white p-10">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-eosin to-hema" />
          <span className="font-bold text-lg">X-PATH</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-snug">
            Your reporting workspace.
          </h1>
          <p className="text-white/70 text-sm mt-3 max-w-sm">
            Secure access for pathologists and lab staff. Private by design.
          </p>
        </div>
        <span className="text-white/40 text-xs">xpath.report</span>
      </section>

      <section className="flex items-center justify-center p-8">
        <form
          action="/api/auth/callback/credentials"
          method="post"
          className="w-full max-w-sm space-y-4"
        >
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-petrol">
              Welcome back
            </p>
            <h2 className="text-xl font-semibold mt-1">Sign in to X-PATH</h2>
          </div>
          <label className="block text-sm font-semibold">
            Work email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-petrol py-2.5 text-white text-sm font-semibold"
          >
            Continue
          </button>
          <p className="text-center text-xs text-neutral-500">
            Two-factor code required after sign-in.
          </p>
        </form>
      </section>
    </main>
  );
}
