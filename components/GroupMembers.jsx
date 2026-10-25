"use client"

import Link from "next/link"
import { UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const formatMoney = (amount) => currency.format(Math.abs(amount ?? 0))
const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?"

export default function GroupMembers({ groupId, members }) {
  return (
    <section className="rounded-2xl border border-sky-200/70 bg-sky-50/50 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold tracking-tight">Members</h2>
          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-sky-500/10 text-sky-600">{members.length}</span>
        </div>
        <Button render={<Link href={`/contacts?group=${groupId}`} />} size="icon-sm" variant="ghost" aria-label="Add member" className="text-sky-600">
          <UserPlus />
        </Button>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {members.map((member) => (
          <div key={member.id} className="rounded-xl px-2 py-2 transition-all duration-200 hover:bg-black/[.03] dark:hover:bg-white/[.04]">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.imageUrl ?? undefined} alt={member.name} />
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{member.role}</p>
              </div>
              <span className={`text-sm font-semibold ${member.totalBalance > 0 ? "text-emerald-600 dark:text-emerald-400" : member.totalBalance < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
                {member.totalBalance === 0 ? "Settled" : `${member.totalBalance > 0 ? "+" : "-"}${formatMoney(member.totalBalance)}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
