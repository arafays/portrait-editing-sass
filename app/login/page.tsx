export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const hasError = searchParams?.error === "1";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-md border border-line bg-background-raised p-6">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
          Swatch
        </p>
        <h1 className="mb-6 text-xl text-foreground">Enter the studio</h1>

        <form action="/api/login" method="POST" className="flex flex-col gap-3">
          <label
            htmlFor="password"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="rounded-[3px] border border-line bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-accent-strong"
          />

          {hasError && (
            <p role="alert" className="rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm text-foreground">
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-md bg-accent px-4 py-3 font-mono text-sm uppercase tracking-[0.14em] text-accent-ink transition-colors hover:bg-accent-strong"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
