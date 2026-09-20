import { HairStudio } from "@/components/HairStudio";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-foreground">
            Swatch
          </span>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <HairStudio />
    </div>
  );
}
