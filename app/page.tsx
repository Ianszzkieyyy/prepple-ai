import Link from "next/link";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import LogoIcon from "@/public/logo-icon.svg"
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Image src={LogoIcon} alt="Logo" className="h-8 w-8" />
            Prepple AI
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <ThemeSwitcher />
            <Button asChild variant="outline">
              <Link href="/auth/login" className="text-foreground">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-24 px-6 py-16">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Prepple AI</h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Automate first-round interviews with an AI HR partner that screens candidates, scores
            performance, and delivers actionable insights to your hiring team.
          </p>
          <div className="mt-4 h-64 w-full max-w-4xl rounded-3xl bg-muted sm:h-80 lg:h-96" />
        </section>

        <section id="features" className="flex flex-col gap-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Built for modern HR teams</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-3xl bg-muted/60 p-8">
              <div className="h-32 rounded-2xl bg-muted" />
              <h3 className="text-xl font-semibold">AI-Led Screening</h3>
              <p className="text-sm text-muted-foreground">
                Launch autonomous interview rooms that qualify applicants before your team steps in.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-3xl bg-muted/60 p-8">
              <div className="h-32 rounded-2xl bg-muted" />
              <h3 className="text-xl font-semibold">Actionable Reports</h3>
              <p className="text-sm text-muted-foreground">
                Receive summaries with tone analysis, performance metrics, and recommended next steps.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-3xl bg-muted/60 p-8">
              <div className="h-32 rounded-2xl bg-muted" />
              <h3 className="text-xl font-semibold">Candidate Experience</h3>
              <p className="text-sm text-muted-foreground">
                Offer jobseekers personalized feedback and preparation tools that keep them engaged.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="rounded-3xl bg-muted/60 p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-32 w-full rounded-2xl bg-muted md:h-40 md:w-40" />
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">About Us</h2>
              <p className="text-sm text-muted-foreground">
                Prepple AI is built for teams balancing high-volume hiring with candidate care. We combine
                real-time voice interviews, Gemini-powered analysis, and Supabase-driven workflows so you can
                focus on conversations that matter most.
              </p>
            </div>
          </div>
        </section>

        <section id="cta" className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Get Started</h2>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Create your first Prepple Room in minutes and start screening with AI-backed insights tailored to
            your roles and company voice.
          </p>
          <div className="h-52 w-full max-w-3xl rounded-3xl bg-muted sm:h-64" />
          <Button asChild size="lg" >
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t bg-muted/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-6 py-6 text-center text-xs text-muted-foreground">
          <Image src={LogoIcon} alt="Logo" className="h-4 w-4" />
          <p>Prepple AI. Developed by GENI Solutions.</p>
        </div>
      </footer>
    </div>
  );
}
