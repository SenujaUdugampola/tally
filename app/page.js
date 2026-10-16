import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ListChecks,
  Quote,
  ReceiptText,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Scale,
    title: "Flexible splits",
    description: "Split equally, by exact amounts, or by percentages.",
    eyebrow: "Make it fair",
    className: "md:col-span-2",
  },
  {
    icon: Users,
    title: "Group organization",
    description:
      "Create groups for trips, roommates, or events with admin controls.",
    eyebrow: "Keep it together",
    className: "",
  },
  {
    icon: WalletCards,
    title: "Seamless settlements",
    description:
      "Keep track of who owes who and record payments instantly.",
    eyebrow: "Close the loop",
    className: "",
  },
];

const steps = [
  {
    number: "01",
    icon: Users,
    title: "Choose your people",
    description: "Create a group or select a friend to start sharing expenses.",
    color: "bg-[#b94bdb]",
  },
  {
    number: "02",
    icon: ReceiptText,
    title: "Add the expense",
    description: "Enter the bill, add participants, and choose exactly how to split it.",
    color: "bg-[#8b5cf6]",
  },
  {
    number: "03",
    icon: Check,
    title: "Settle up",
    description: "Check balances and record payments in a few clicks.",
    color: "bg-[#6366f1]",
  },
];

const testimonials = [
  {
    quote:
      "Tally means I never have to do the awkward 'you owe me' conversation after a trip.",
    name: "Maya R.",
    detail: "Frequent traveler",
  },
  {
    quote:
      "The split options are exactly what our house needed. It keeps our monthly bills simple.",
    name: "Jordan K.",
    detail: "Roommate",
  },
  {
    quote:
      "Everyone can see the same numbers, so settling up takes seconds instead of a spreadsheet.",
    name: "Alex P.",
    detail: "Event organizer",
  },
];

function SectionEyebrow({ children }) {
  return (
    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#b94bdb] dark:text-[#b94bdb]/80">
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-background">
      <section className="relative isolate px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_right,rgba(185,75,219,0.2),transparent_45%),radial-gradient(circle_at_top_left,rgba(185,75,219,0.12),transparent_40%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b94bdb]/30 bg-[#b94bdb]/10 px-3 py-1.5 text-sm font-medium text-[#b94bdb] dark:border-[#b94bdb]/40 dark:bg-[#b94bdb]/20 dark:text-[#b94bdb]/90">
              <Sparkles className="h-4 w-4" />
              Money conversations, made simple
            </div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Share expenses
              <span className="block text-[#b94bdb] dark:text-[#b94bdb]/90">
                without the math.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              The easiest way to track balances, split bills with friends and
              family, and settle up in seconds.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-[#b94bdb] px-6 text-base text-white shadow-lg shadow-[#b94bdb]/30 hover:bg-[#b94bdb]/90"
                // asChild
                render={<Link href="/sign-up" />}
              >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#b94bdb]" />
                Free to get started
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-[#b94bdb]" />
                No spreadsheets required
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#b94bdb]/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#b94bdb]/25 bg-[#f6edff] p-2 shadow-2xl shadow-[#b94bdb]/20">
              <Image
                src="/hero-image.jpg"
                alt="Friends sharing expenses with Tally"
                width={2000}
                height={1500}
                priority
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-border bg-purple-50/70 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <SectionEyebrow>Everything adds up</SectionEyebrow>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                A clearer way to share the everyday.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              From a weekend away to monthly bills, Tally keeps every shared
              expense clear, fair, and easy to act on.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, eyebrow, className }, index) => (
              <Card
                key={title}
                className={`group relative overflow-hidden border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#b94bdb]/10 ${className}`}
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#b94bdb]/10 transition-transform group-hover:scale-125" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b94bdb]/15 text-[#b94bdb]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-4xl font-semibold text-[#b94bdb]/15">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#b94bdb]">
                    {eyebrow}
                  </p>
                  <CardTitle className="mt-2 text-xl">{title}</CardTitle>
                  <CardDescription className="pt-1 text-base leading-7">
                    {description}
                  </CardDescription>
                </CardHeader>
                {index === 0 && (
                  <CardContent className="relative mt-2">
                    <div className="rounded-xl border border-border bg-muted/40 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Dinner · $120</span>
                        <span className="font-semibold text-[#b94bdb]">3 ways</span>
                      </div>
                      <div className="mt-3 flex gap-1">
                        <div className="h-2 flex-1 rounded-full bg-[#b94bdb]" />
                        <div className="h-2 flex-1 rounded-full bg-[#b94bdb]/60" />
                        <div className="h-2 flex-1 rounded-full bg-[#b94bdb]/30" />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative bg-background px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <span id="howitworks" className="absolute -top-20" aria-hidden="true" />
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Shared spending, without the spreadsheet.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps keep everyone on the same page.
            </p>
          </div>
          <div className="relative mt-14 grid gap-5 md:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-px bg-gradient-to-r from-[#b94bdb] via-[#8b5cf6] to-[#6366f1] md:block" />
            {steps.map(({ number, icon: Icon, title, description, color }) => (
              <Card key={number} className="relative border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg ${color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="mt-6 block text-sm font-bold tracking-[0.2em] text-muted-foreground">
                    {number}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border bg-purple-50/70 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute -right-24 top-12 h-64 w-64 rounded-full bg-[#b94bdb]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <SectionEyebrow>Real people, less awkwardness</SectionEyebrow>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                The easiest conversation is the one you never have to start.
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span>Made for shared moments</span>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="relative overflow-hidden border-0 bg-[#b94bdb] text-white shadow-xl shadow-[#b94bdb]/20">
              <CardContent className="flex h-full flex-col justify-between p-8 sm:p-10">
                <Quote className="h-10 w-10 text-white/40" />
                <blockquote className="mt-10 text-2xl font-medium leading-relaxed sm:text-3xl">
                  &ldquo;{testimonials[0].quote}&rdquo;
                </blockquote>
                <div className="mt-10 flex items-center gap-3 border-t border-white/20 pt-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 font-semibold">
                    MR
                  </div>
                  <div>
                    <p className="font-semibold">{testimonials[0].name}</p>
                    <p className="text-sm text-white/70">{testimonials[0].detail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-5">
              {testimonials.slice(1).map(({ quote, name, detail }) => (
                <Card key={name} className="border-border bg-background shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-5 flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="leading-7 text-foreground">&ldquo;{quote}&rdquo;</p>
                    <div className="mt-5">
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#b94bdb]/15 bg-gradient-to-r from-[#e9c9f5] via-[#ddccfa] to-[#cad8ff] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#b94bdb]/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-2 text-center sm:px-12">
          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/55 text-[#a53bc9] shadow-sm ring-1 ring-white/70">
              <ListChecks className="h-7 w-7" />
            </div>
            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[#8e2db2]">
              Your next shared expense
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Ready to simplify expense sharing?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
              Join people who make splitting expenses stress-free with Tally.
            </p>
            <Button
              size="lg"
              className="mt-9 h-12 bg-[#b94bdb] px-6 text-base text-white shadow-lg shadow-[#b94bdb]/25 hover:bg-[#b94bdb]/80"
              // asChild
              render={<Link href="/sign-up" />}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-5 text-sm text-slate-600">
              Free to get started · No spreadsheets required
            </p>
          </div>
        </div>
      </section>

      {/* <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tally. Shared spending, simplified.</p>
          <nav className="flex gap-5">
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer> */}
    </main>
  );
}