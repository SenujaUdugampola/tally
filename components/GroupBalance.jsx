"use client"

import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp, WalletCards } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const formatMoney = (amount) => currency.format(Math.abs(amount ?? 0))
const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?"

function BalancePerson({ member, amount, direction }) {
  const owedToYou = direction === "owed"

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10">
        <AvatarImage src={member.imageUrl ?? undefined} alt={member.name} />
        <AvatarFallback>{initials(member.name)}</AvatarFallback>
      </Avatar>
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{member.name}</p>
      <p className={`text-sm font-semibold ${owedToYou ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
        {owedToYou ? "+" : "-"}{formatMoney(amount)}
      </p>
    </div>
  )
}

export default function GroupBalance({ userNetBalance, totalSpending, balances = [] }) {
  const owedToYou = balances.filter((member) => member.owedToYou > 0)
  const youOwe = balances.filter((member) => member.youOwe > 0)

  return (
    <section className="rounded-2xl border border-[#ead8ef] bg-[#fff8ff]/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Your group balance</p>
          <p className={`mt-2 text-3xl font-bold ${userNetBalance > 0 ? "text-emerald-600 dark:text-emerald-400" : userNetBalance < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
            {userNetBalance > 0 ? "+" : userNetBalance < 0 ? "-" : ""}{formatMoney(userNetBalance)}
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#b94bdb]/10 text-[#a23bc3]">
          {userNetBalance < 0 ? <TrendingDown /> : userNetBalance > 0 ? <TrendingUp /> : <WalletCards />}
        </div>
      </div>
      <div className="mt-6 border-t border-border/60 pt-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total group spending</p>
        <p className="mt-1 text-xl font-semibold">{formatMoney(totalSpending)}</p>
      </div>
      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          <ArrowDownLeft className="size-4" />
          <span>Owed to you</span>
        </div>
        <div className="mt-4 space-y-4">
          {owedToYou.length ? owedToYou.map((member) => (
            <BalancePerson key={member.id} member={member} amount={member.owedToYou} direction="owed" />
          )) : <p className="text-sm text-muted-foreground">No one currently owes you.</p>}
        </div>

        <div className="my-5 border-t border-border/60" />

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
          <ArrowUpRight className="size-4" />
          <span>You owe</span>
        </div>
        <div className="mt-4 space-y-4">
          {youOwe.length ? youOwe.map((member) => (
            <BalancePerson key={member.id} member={member} amount={member.youOwe} direction="owe" />
          )) : <p className="text-sm text-muted-foreground">You do not owe anyone.</p>}
        </div>
      </div>
    </section>
  )
}
