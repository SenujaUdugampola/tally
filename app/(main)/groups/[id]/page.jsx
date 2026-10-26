"use client"

import Link from "next/link"
import { use } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { useConvexQuery, useConvexMutation } from "@/hooks/useConvexQuery"
import ExpenseList from "@/components/expenseList"
import SettlementList from "@/components/settlementList"
import GroupBalance from "@/components/GroupBalance"
import GroupMembers from "@/components/GroupMembers"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, HandCoins, LoaderCircle, Plus, Receipt, Users } from "lucide-react"

function EmptyState({ type, groupId }) {
  const expenses = type === "expenses"
  return (
    <div className="rounded-2xl border border-dashed border-[#b94bdb]/25 px-6 py-12 text-center">
      {expenses ? <Receipt className="mx-auto size-6 text-[#a23bc3]" /> : <HandCoins className="mx-auto size-6 text-sky-600" />}
      <p className="mt-3 text-sm font-medium">{expenses ? "No group expenses yet" : "No settlements yet"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{expenses ? "Add an expense to start tracking this group." : "Recorded payments will appear here."}</p>
      {expenses && <Button render={<Link href={`/expenses/new?group=${groupId}`} />} className="mt-4 bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white"><Plus /> Add expense</Button>}
    </div>
  )
}

export default function GroupPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, loading } = useConvexQuery(api.groups.getGroupExpenses, { groupId: id })
  const { data: currentUser, loading: currentUserLoading } = useConvexQuery(api.users.getCurrentUser)
  const deleteExpense = useConvexMutation(api.expenses.deleteExpense)

  if (loading || currentUserLoading || !data || !currentUser) {
    return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="size-8 animate-spin text-[#CB6CE7]" /><span className="sr-only">Loading group details</span></div>
  }

  // 1. Destructure 'balances' back out of the query data
  const { group, members, expenses, settlements, balances, userLookupMap } = data

  // 2. Map the backend's perfect ledger math to the fields your UI expects
  const calculatedBalances = balances.map((member) => {
    // Find how much this member owes the current user
    const owesCurrentUser = member.owes.find((o) => o.to === currentUser._id)?.amount ?? 0
    // Find how much the current user owes this member
    const currentUserOwes = member.owedBy.find((o) => o.from === currentUser._id)?.amount ?? 0

    return {
      ...member,
      totalBalance: member.totalBalance,
      owedToYou: owesCurrentUser,
      youOwe: currentUserOwes,
    }
  })

  // 3. Extract the top-level metrics
  const userNetBalance = calculatedBalances.find((m) => m.id === currentUser._id)?.totalBalance ?? 0
  const totalSpending = expenses.reduce((total, expense) => total + expense.amount, 0)

  const currentUserForUi = {
    id: currentUser._id,
    name: currentUser.name,
    imageUrl: currentUser.imageUrl,
  }

  return (
    <div className="relative min-h-[80vh] overflow-hidden px-4 pb-12 sm:px-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 pl-0 text-muted-foreground hover:bg-transparent hover:text-[#a23bc3]"><ArrowLeft /> Back</Button>
        <header className="mb-6 flex flex-col gap-5 rounded-3xl border border-white/70 bg-[#faf9ff]/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b94bdb] to-[#8068e8] text-white"><Users className="size-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{group.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{group.description || `${members.length} members sharing expenses`}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button render={<Link href={`/expenses/new?group=${group.id}`} />} className="bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white"><Plus /> Add expense</Button>
            <Button render={<Link href={`/settlements/new?group=${group.id}`} />} variant="outline" className="border-[#b94bdb]/40 text-[#a23bc3] hover:bg-[#b94bdb]/10"><HandCoins /> Settle up</Button>
          </div>
        </header>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <GroupBalance userNetBalance={userNetBalance} totalSpending={totalSpending} balances={calculatedBalances} />
          <GroupMembers groupId={group.id} members={calculatedBalances} />
        </div>

        <Tabs defaultValue="expenses">
          <TabsList variant="line">
            <TabsTrigger value="expenses"><Receipt /> Expenses ({expenses.length})</TabsTrigger>
            <TabsTrigger value="settlements"><HandCoins /> Settlements ({settlements.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses" className="mt-6">
            {!expenses.length ? <EmptyState type="expenses" groupId={group.id} /> : <div className="space-y-3">{[...expenses].sort((a, b) => b.date - a.date).map((expense) => <ExpenseList key={expense._id} expense={expense} payer={userLookupMap[expense.paidByUserId]} currentUser={currentUserForUi} deleting={deleteExpense.loading} onDelete={deleteExpense.mutate} />)}</div>}
          </TabsContent>
          <TabsContent value="settlements" className="mt-6">
            {!settlements.length ? <EmptyState type="settlements" groupId={group.id} /> : <div className="space-y-3">{[...settlements].sort((a, b) => b.date - a.date).map((settlement) => {
              const otherId = settlement.paidByUserId === currentUser._id ? settlement.receivedByUserId : settlement.paidByUserId
              return <SettlementList key={settlement._id} settlement={settlement} currentUser={currentUserForUi} friend={userLookupMap[otherId]} />
            })}</div>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}