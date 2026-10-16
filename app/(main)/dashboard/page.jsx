"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { api } from "@/convex/_generated/api"
import { useConvexQuery } from "@/hooks/useConvexQuery"
import CreateGroupModal from "../contacts/_components/creategroupModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  HandCoins,
  LoaderCircle,
  Plus,
  Receipt,
  Users,
  WalletCards,
} from "lucide-react"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const formatMoney = (amount) => currency.format(Math.abs(amount ?? 0))
const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(date)
  )
const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?"

const moneyClass = (amount) =>
  amount > 0 ? "text-emerald-600 dark:text-emerald-400" :
    amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#b94bdb]/25 px-5 py-10 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#b94bdb]/10 text-[#b94bdb]">
        <Icon className="size-5" />
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

function SectionHeader({ title, description, href, linkLabel = "View all" }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && <Link href={href} className="text-sm font-medium text-[#a23bc3] hover:underline">{linkLabel}</Link>}
    </div>
  )
}

function BalanceCard({ title, amount, count, tone, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#ead8ef] bg-[#fff8ff]/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`flex size-9 items-center justify-center rounded-xl ${tone === "positive" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold ${tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
        {formatMoney(amount)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{count} {count === 1 ? "person" : "people"}</p>
    </div>
  )
}

function SpendingSummary({ totalSpent, monthlySpending }) {
  const now = new Date()
  const thisMonth = monthlySpending?.find(
    (item) => new Date(item.monthStart).getMonth() === now.getMonth()
  )?.total ?? 0
  const maximum = Math.max(...(monthlySpending ?? []).map((item) => item.total), 1)

  return (
    <section className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:p-6">
      <SectionHeader title="Spending summary" description="Your personal spending this year" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[#f8eaff] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-[#b94bdb]/15">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This month</p>
          <p className="mt-2 text-xl font-bold">{formatMoney(thisMonth)}</p>
        </div>
        <div className="rounded-xl bg-[#eeedff] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-[#8068e8]/15">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This year</p>
          <p className="mt-2 text-xl font-bold">{formatMoney(totalSpent)}</p>
        </div>
      </div>
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {(monthlySpending ?? []).map((item) => {
          const month = new Date(item.monthStart)
          const height = item.total ? Math.max((item.total / maximum) * 100, 8) : 4
          return (
            <div key={item.monthStart} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="group relative flex h-full w-full items-end">
                <div
                  className={`w-full rounded-t-md transition-colors ${month.getMonth() === now.getMonth() ? "bg-gradient-to-t from-[#b94bdb] to-[#8068e8]" : "bg-[#b94bdb]/25 hover:bg-[#b94bdb]/50"}`}
                  style={{ height: `${height}%` }}
                  title={`${month.toLocaleString("en-US", { month: "long" })}: ${formatMoney(item.total)}`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{month.toLocaleString("en-US", { month: "short" }).slice(0, 3)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function RecentActivity({ activity }) {
  return (
    <section className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:p-6">
      <SectionHeader title="Recent activity" description="Your latest expenses and settlements" href="/activity" />
      {!activity?.length ? (
        <EmptyState icon={Receipt} title="No activity yet" description="Your recent shared expenses will appear here." />
      ) : (
        <div className="space-y-1">
          {activity.slice(0, 5).map((item) => {
            const expense = item.type === "expense"
            return (
              <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.04]">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${expense ? "bg-[#b94bdb]/10 text-[#a23bc3]" : "bg-sky-500/10 text-sky-600"}`}>
                  {expense ? <Receipt className="size-4" /> : <HandCoins className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {expense ? item.description : item.direction === "paid" ? `You paid ${item.receivedBy}` : `${item.paidBy} paid you`}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(item.date)}</span>
                    {expense && <><span>·</span><span>Paid by {item.paidBy}</span><Badge variant="outline">{item.splitType}</Badge></>}
                    {!expense && item.note && <><span>·</span><span className="truncate">{item.note}</span></>}
                  </div>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${expense ? moneyClass(item.amount) : item.direction === "received" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {expense ? `${item.amount >= 0 ? "+" : "-"}${formatMoney(item.amount)}` : formatMoney(item.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function BalanceBreakdown({ balance }) {
  const renderRows = (items, owed) => items?.length ? items.map((person) => (
    <Link key={person.userId} href={`/person/${person.userId}`} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.04]">
      <Avatar>
        <AvatarImage src={person.imageUrl ?? undefined} alt={person.name} />
        <AvatarFallback>{initials(person.name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{person.name}</span>
      <span className={`text-sm font-semibold ${owed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
        {owed ? "+" : "-"}{formatMoney(person.amount)}
      </span>
    </Link>
  )) : <p className="py-3 text-sm text-muted-foreground">No outstanding balances.</p>

  return (
    <section className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:p-6">
      <SectionHeader title="Balance breakdown" description="One-to-one balances" href="/balances" />
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600"><ArrowDownLeft className="size-3" /> Owed to you</div>
        {renderRows(balance?.ownDetails?.youAreOwed, true)}
      </div>
      <div className="mt-5 border-t border-border/60 pt-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-600"><ArrowUpRight className="size-3" /> You owe</div>
        {renderRows(balance?.ownDetails?.youOwe, false)}
      </div>
    </section>
  )
}

function GroupList({ groups, onCreate }) {
  return (
    <section className="rounded-2xl border border-[#f0e5f5] bg-[#faf9ff]/90 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:p-6">
      <SectionHeader title="Your groups" description="Shared spaces you belong to" href="/contacts" />
      {!groups?.length ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group to start sharing expenses."
          action={<Button onClick={onCreate} className="mt-4 bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white"><Plus /> Create group</Button>}
        />
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[.03] dark:hover:bg-white/[.04]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#b94bdb] to-[#8068e8] text-white"><Users className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{group.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{group.members?.length ?? 0} members</p>
              </div>
              <span className={`text-right text-sm font-semibold ${moneyClass(group.balance)}`}>
                {group.balance === 0 ? "Settled up" : `${group.balance > 0 ? "+" : "-"}${formatMoney(group.balance)}`}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const balance = useConvexQuery(api.dashboard.getUserBalance)
  const totalSpent = useConvexQuery(api.dashboard.getTotalSpent)
  const monthlySpending = useConvexQuery(api.dashboard.getMonthlySpending)
  const groups = useConvexQuery(api.dashboard.getUserGroups)
  const activity = useConvexQuery(api.dashboard.getRecentActivity)
  const loading = [balance, totalSpent, monthlySpending, groups, activity].some((result) => result.loading)
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="size-8 animate-spin text-[#CB6CE7]" /><span className="sr-only">Loading dashboard</span></div>
  }

  const net = balance.data?.totalBalance ?? 0
  return (
    <div className="relative min-h-[80vh] overflow-hidden px-4 pb-12 sm:px-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/65 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-white/10 dark:bg-white/5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#b94bdb]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#a23bc3]"><span className="size-1.5 rounded-full bg-[#b94bdb]" /> Your overview</div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
            <p className="mt-2 max-w-md text-muted-foreground">Keep track of shared expenses, balances, and spending in one place.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button render={<Link href="/expenses/new" />} size="lg" className="h-11 bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white hover:from-[#a941c5] hover:to-[#7058d5]"><Plus /> Add Expense</Button>
            <Button render={<Link href="/settlements/new" />} size="lg" variant="outline" className="h-11 border-[#b94bdb]/40 text-[#a23bc3] hover:bg-[#b94bdb]/10"><CreditCard /> Settle Up</Button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eeebfa] bg-[#f9f8ff]/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Total net balance</p><WalletCards className="size-4 text-[#a23bc3]" /></div>
            <p className={`mt-3 text-2xl font-bold ${moneyClass(net)}`}>{net > 0 ? "+" : net < 0 ? "-" : ""}{formatMoney(net)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{net === 0 ? "You are all settled up" : net > 0 ? "You are owed overall" : "You owe overall"}</p>
          </div>
          <BalanceCard title="You are owed" amount={balance.data?.youAreOwed} count={balance.data?.ownDetails?.youAreOwed?.length ?? 0} tone="positive" icon={ArrowDownLeft} />
          <BalanceCard title="You owe" amount={balance.data?.youOwe} count={balance.data?.ownDetails?.youOwe?.length ?? 0} tone="negative" icon={ArrowUpRight} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <SpendingSummary totalSpent={totalSpent.data} monthlySpending={monthlySpending.data} />
            <RecentActivity activity={activity.data} />
          </div>
          <div className="space-y-6">
            <BalanceBreakdown balance={balance.data} />
            <GroupList groups={groups.data} onCreate={() => setIsCreatingGroup(true)} />
          </div>
        </div>
        {/* <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Spending totals for {currentYear}</p> */}
      </div>
      <CreateGroupModal isOpen={isCreatingGroup} onClose={() => setIsCreatingGroup(false)} />
    </div>
  )
}
