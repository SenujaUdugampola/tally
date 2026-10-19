"use client"

import Link from "next/link"
import { use } from "react"
import { api } from "@/convex/_generated/api"
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  HandCoins,
  LoaderCircle,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategoryById, getCategoryIcon } from "@/lib/expense-categories"

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
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?"

function EmptyState({ friendId }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#b94bdb]/25 px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#b94bdb]/10 text-[#b94bdb]">
        <Receipt className="size-6" />
      </div>
      <h2 className="text-lg font-semibold">No shared expenses yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your first expense with this person to start tracking your balance.
      </p>
      <Button
        render={<Link href={`/expenses/new?friend=${friendId}`} />}
        className="mt-6 bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white"
      >
        <Plus />
        Add expense
      </Button>
    </div>
  )
}

function ExpenseCard({ expense, friend, currentUser, onDelete, deleting }) {
  const currentSplit = expense.splits.find(
    (split) => split.userId === currentUser.id
  )
  const friendSplit = expense.splits.find(
    (split) => split.userId === friend.id
  )
  const currentUserPaid = expense.paidByUserId === currentUser.id
  const sharedAmount = currentUserPaid
    ? friendSplit?.amount ?? 0
    : currentSplit?.amount ?? 0
  const lent = currentUserPaid

  const category = getCategoryById(expense.category)
  const CategoryIcon = getCategoryIcon(category.id);

  return (
    <div className="rounded-2xl border border-[#ead8ef] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[.03]">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#b94bdb]/10 text-[#a23bc3]">
          {/* category icon */}
          <CategoryIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{expense.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(expense.date)}</p>
            </div>
            {expense.createdBy === currentUser.id && (
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
            <div className="">
              <p className="text-xs text-muted-foreground">
                {currentUserPaid ? "You" : friend.name} paid
              </p>
              <p className={`mt-1 text-sm font-medium`}>
                Total: {formatMoney(expense.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Your share</p>
              <p className={`mt-1 text-sm font-semibold ${lent ? "text-emerald-600" : "text-rose-600"}`}>
                {lent ? formatMoney(sharedAmount) : formatMoney(sharedAmount)}
                {/* {formatMoney(currentSplit?.amount ?? 0)} */}
              </p>
              {/* <p className={`text-xs font-medium ${lent ? "text-emerald-600" : "text-rose-600"}`}>
                {lent ? `You lent ${formatMoney(sharedAmount)}` : `You owe ${formatMoney(sharedAmount)}`}
              </p> */}
            </div>
          </div>
          {/* {(expense.category || expense.splitType) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {[expense.category, expense.splitType && `${expense.splitType} split`].filter(Boolean).join(" · ")}
            </p>
          )} */}
        </div>
      </div>
    </div>
  )
}

function SettlementCard({ settlement, friend, currentUser }) {
  const youPaid = settlement.paidByUserId === currentUser.id

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-sky-200/70 bg-sky-50/50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-sky-400/20 dark:bg-sky-400/[.05]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
        <HandCoins className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {youPaid ? `You paid ${friend.name}` : `${friend.name} paid you`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(settlement.date)}</p>
          </div>
          <span className={`shrink-0 text-sm font-semibold ${youPaid ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {youPaid ? "-" : "+"}{formatMoney(settlement.amount)}
          </span>
        </div>
        {settlement.note && (
          <p className="mt-3 rounded-lg px-3 py-2 text-xs text-muted-foreground dark:bg-white/[.04]">
            {settlement.note}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PersonPage({ params }) {
  const { id } = use(params)
  const { data, loading } = useConvexQuery(
    api.expenses.getExpensesBetweenUsers,
    { userId: id }
  )
  const deleteExpense = useConvexMutation(api.expenses.deleteExpense)

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="size-8 animate-spin text-[#CB6CE7]" />
        <span className="sr-only">Loading person details</span>
      </div>
    )
  }


  const { other: friend, currentUser, expenses, settlements, balance } = data
  const balanceLabel =
    balance === 0
      ? "You are all settled up"
      : balance > 0
        ? `${friend.name} owes you`
        : `You owe ${friend.name}`

  return (
    <div className="relative min-h-[80vh] overflow-hidden px-4 pb-12 sm:px-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6">
          <Button
            render={<Link href="/contacts" />}
            variant="ghost"
            className="pl-0 text-muted-foreground hover:bg-transparent hover:text-[#a23bc3]"
          >
            <ArrowLeft />
            Back to contacts
          </Button>
        </div>

        <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="ring-4 ring-[#f1c8f7]">
              <AvatarImage src={friend.imageUrl ?? undefined} alt={friend.name} />
              <AvatarFallback className="bg-[#f8ddfb] text-[#a23bc3]">
                {initials(friend.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {friend.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{friend.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              render={<Link href={`/expenses/new?friend=${friend.id}`} />}
              className="bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white"
            >
              <Plus />
              Add expense
            </Button>
            <Button
              render={<Link href={`/settlements/new?friend=${friend.id}`} />}
              variant="outline"
              className="border-[#b94bdb]/40 text-[#a23bc3] hover:bg-[#b94bdb]/10"
            >
              <CreditCard />
              Settle up
            </Button>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-[#ead8ef] bg-[#fff8ff]/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Net balance</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  balance > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : balance < 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                }`}
              >
                {balance > 0 ? "+" : balance < 0 ? "-" : ""}
                {formatMoney(balance)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{balanceLabel}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#b94bdb]/10 text-[#a23bc3]">
              {balance >= 0 ? <ArrowDownLeft /> : <ArrowUpRight />}
            </div>
          </div>
        </section>

        <Tabs defaultValue="expenses" className="mt-2">
          <TabsList variant="line">
            <TabsTrigger value="expenses" className="px-8 py-2">
              <Receipt className="mr-2 size-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="settlements" className="px-8 py-2">
              <HandCoins className="mr-2 size-4" />
              Settlements
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="expenses" className="mt-6">
              <section className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold tracking-tight">Expenses</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Shared expenses between you and {friend.name}.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{expenses.length} total</span>
                </div>
                {!expenses.length ? (
                  <EmptyState friendId={friend.id} />
                ) : (
                  <div className="space-y-3">
                    {[...expenses].sort((a, b) => b.date - a.date).map((expense) => (
                      <ExpenseCard
                        key={expense._id}
                        expense={expense}
                        friend={friend}
                        currentUser={currentUser}
                        deleting={deleteExpense.loading}
                        onDelete={deleteExpense.mutate}
                      />
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>
            <TabsContent value="settlements" className="mt-6">
              <section className="rounded-2xl border border-sky-200/70 bg-[#f8fcff]/90 p-5 shadow-sm dark:border-sky-400/20 dark:bg-white/5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold tracking-tight">Settlements</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Payments recorded between you and {friend.name}.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{settlements.length} total</span>
                </div>
                {!settlements.length ? (
                  <div className="rounded-2xl border border-dashed border-sky-300/50 px-6 py-10 text-center dark:border-sky-400/20">
                    <HandCoins className="mx-auto size-6 text-sky-600" />
                    <p className="mt-3 text-sm font-medium">No settlements yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Payments will appear here once recorded.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...settlements].sort((a, b) => b.date - a.date).map((settlement) => (
                      <SettlementCard
                        key={settlement._id}
                        settlement={settlement}
                        friend={friend}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
