"use client"

import { Button } from "@/components/ui/button"
import { getCategoryById, getCategoryIcon } from "@/lib/expense-categories"
import { Trash2 } from "lucide-react"
import { createElement } from "react"

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

export default function ExpenseList({ expense, friend, currentUser, onDelete, deleting }) {
    const currentSplit = expense.splits.find((split) => split.userId === currentUser.id)
    const friendSplit = friend
        ? expense.splits.find((split) => split.userId === friend.id)
        : null
    const currentUserPaid = expense.paidByUserId === currentUser.id
    const sharedAmount = currentUserPaid ? friendSplit?.amount ?? 0 : currentSplit?.amount ?? 0
    const category = getCategoryById(expense.category)
    const categoryIcon = getCategoryIcon(category.id)

    return (
        <div className="rounded-2xl border border-[#ead8ef] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[.03]">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#b94bdb]/10 text-[#a23bc3]">
                    {createElement(categoryIcon, { className: "size-4" })}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{expense.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                        </div>
                        {onDelete && expense.createdBy === currentUser.id && (
                            <Button
                                aria-label={`Delete ${expense.description}`}
                                disabled={deleting}
                                onClick={() => onDelete(expense._id)}
                                size="icon-xs"
                                variant="ghost"
                                className="text-muted-foreground hover:text-rose-600"
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl p-3 dark:bg-white/[.04]">
                        <div>
                            <p className="text-xs text-muted-foreground">{currentUserPaid ? "You" : friend?.name ?? "Member"} paid</p>
                            <p className="mt-1 text-sm font-medium">Total: {formatMoney(expense.amount)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Your share</p>
                            <p className={`mt-1 text-sm font-semibold ${currentUserPaid ? "text-emerald-600" : "text-rose-600"}`}>
                                {formatMoney(currentSplit?.amount ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}