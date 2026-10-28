"use client"

import Link from "next/link"
import { use } from "react"
import { api } from "@/convex/_generated/api"
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ExpenseList from "@/components/expenseList"
import SettlementList from "@/components/settlementList"
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  HandCoins,
  LoaderCircle,
  Plus,
  Receipt,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const formatMoney = (amount) => currency.format(Math.abs(amount ?? 0))
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

export default function PersonPage({ params }) {
  const router = useRouter();
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
            onClick={() => router.back()}
            variant="ghost"
            className="pl-0 text-muted-foreground hover:bg-transparent hover:text-[#a23bc3]"
          >
            <ArrowLeft />
            Back
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
              className="h-11 bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white"
            >
              <Plus />
              Add expense
            </Button>
            <Button
              render={<Link href={`/settlements/user/${friend.id}`} />}
              variant="outline"
              className="h-11 border-[#b94bdb]/40 text-[#a23bc3] hover:bg-[#b94bdb]/10"
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
                className={`mt-2 text-3xl font-bold ${balance > 0
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
              Expenses ({expenses.length})
            </TabsTrigger>
            <TabsTrigger value="settlements" className="px-8 py-2">
              <HandCoins className="mr-2 size-4" />
              Settlements ({settlements.length})
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
                  {/* <span className="text-xs text-muted-foreground">{expenses.length} total</span> */}
                </div>
                {!expenses.length ? (
                  <EmptyState friendId={friend.id} />
                ) : (
                  <div className="space-y-3">
                    {[...expenses].sort((a, b) => b.date - a.date).map((expense) => (
                      <ExpenseList
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
                  {/* <span className="text-xs text-muted-foreground">{settlements.length} total</span> */}
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
                      <SettlementList
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
