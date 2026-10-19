"use client"

import { HandCoins } from "lucide-react"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const formatMoney = (amount) => currency.format(Math.abs(amount ?? 0))
const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))

export default function SettlementList({ settlement, friend, currentUser }) {
  const youPaid = settlement.paidByUserId === currentUser.id

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-sky-200/70 bg-sky-50/50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-sky-400/20 dark:bg-sky-400/[.05]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
        <HandCoins className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{youPaid ? `You paid ${friend?.name ?? "a member"}` : `${friend?.name ?? "A member"} paid you`}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(settlement.date)}</p>
          </div>
          <span className={`shrink-0 text-sm font-semibold ${youPaid ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {youPaid ? "-" : "+"}{formatMoney(settlement.amount)}
          </span>
        </div>
        {settlement.note && <p className="mt-3 rounded-lg px-3 py-2 text-xs text-muted-foreground dark:bg-white/[.04]">{settlement.note}</p>}
      </div>
    </div>
  )
}