import { api } from "./_generated/api";
import { query } from "./_generated/server";

// Get user balance
export const getUserBalance = query({
    handler:async (ctx) => {
        const user = await ctx.runQuery(api.users.getCurrentUser);
        
        // 1-to-1 expenses (no groupId)
        // Filter expenses to only include one-on-one expenses (not group expenses)
        // where the current user is either the payer or in the splits
        const expenses =(await ctx.db.query("expenses").collect()).filter(
            (e) =>
                !e.groupId && // 1-to-1 only
                (e.paidByUserId === user._id ||
                    e.splits.some((s) => s.userId === user._id))
        );

        let youOwe = 0;
        let youAreOwed = 0;
        const balanceByUser = {};

        for(const e of expenses) {
            const isPayer = e.paidByUserId === user._id;
            const mySplit = e.splits.find((s) => s.userId === user._id);

            if(isPayer) {
                for(const s of e.splits) {
                    // skip user's own split or alraady paid ones
                    if(s.userId !== user._id || s.paid) continue;

                    youAreOwed += s.amount;

                    (balanceByUser[s.userId] ??= { youOwe: 0, youAreOwed: 0 }).youAreOwed += s.amount;

                }
            } else if(mySplit && !mySplit.paid) {
                // other person paid user not paid split
                youOwe += mySplit.amount;

                // add to amount the current user ows to payer
                (balanceByUser[e.paidByUserId] ??= { youOwe: 0, youAreOwed: 0 }).youOwe += mySplit.amount;
            }
        }

        // 1-to-1 settlements (no groupId)
        // Get settlements that directly involve the current user
         const settlements = (await ctx.db.query("settlements").collect()).filter(
            (s) =>
                !s.groupId &&
                (s.paidByUserId === user._id || s.receivedByUserId === user._id)
        );

        for(const s of settlements) {
            if(s.paidByUserId === user._id) {
                // user paid someone else - reduce what user pays
                youAreOwed -= s.amount;
                (balanceByUser[s.receivedByUserId] ??= { youOwe: 0, youAreOwed: 0 }).youAreOwed -= s.amount;
            } else {
                // someone paid user - reduce what they owe user
                youAreOwed -= s.amount;
                (balanceByUser[s.paidByUserId] ??= { youOwe: 0, youAreOwed: 0 }).youOwe -= s.amount;
            }
        }

        const youOweList = [];
        const youAreOwedByList = [];

        for (const [uid, {youOwe, youAreOwed}] of Object.entries(balanceByUser)) {
            const net = youAreOwed - youOwe;
            if (net === 0) continue;

            const counterpart = await ctx.db.get(uid);
            const base = {
                userId: uid,
                name: counterpart?.name ?? "Unknown",
                imageUrl: counterpart?.imageUrl,
                amount: Math.abs(net),
            };

            net > 0 ? youAreOwedByList.push(base) : youOweList.push(base);
        }

        youOweList.sort((a, b) => b.amount - a.amount);
        youAreOwedByList.sort((a, b) => b.amount - a.amount);

        return {
            youOwe,
            youAreOwed,
            totalBalance: youAreOwed - youOwe,
            ownDetails: {youOwe: youOweList, youAreOwed: youAreOwedByList},
        };
    },
})

export const getTotalSpent = query({
    handler:async (ctx) => {
        const user = await ctx.runQuery(api.users.getCurrentUser);

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_date", (q) => q.gte("date", startOfYear));

        // Filter expenses to only include those where the user is involved
        const userExpenses = expenses.filter(
            (expense) =>
                expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
        );

        let totalSpent = 0

        userExpenses.forEach((expense) => {
            const userSplit = expense.splits.find(
                (split) => split.userId === user._id
            );

            if (userSplit) {
                totalSpent += userSplit.amount;
            }
        });

        return totalSpent;
    }
})

export const getMonthlySpending = query({
    handler:async (ctx) => {
        const user = await ctx.runQuery(api.users.getCurrentUser);

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        // get all expenses for the current year
        const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_date", (q) => q.gte("date", startOfYear))
            .collect();
        
        // Filter expenses to only include those where the user is involved
        const userExpenses = expenses.filter(
            (expense) =>
                expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
        );

        const monthlyTotals = {};

        for (let month = 0; month < 12; month++) {
            const monthDate = new Date(currentYear, month, 1);
            monthlyTotals[monthDate.getTime()] = 0;
        }

        userExpenses.forEach((expense) => {
            const date = new Date(expense.date);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();

            const userSplit = expense.splits.find(
                (split) => split.userId === user._id
            );

            if (userSplit) {
                monthlyTotals[monthStart] = (monthlyTotals[monthStart] || 0) + userSplit.amount;
            }
        });

        const result = Object.entries(monthlyTotals).map(([monthStart, total]) => ({
            monthStart: parseInt(monthStart),
            total,
        }));

        result.sort((a, b) => a.monthStart - b.monthStart);

        return result;
    }
})

export const getUserGroups = query({
    handler:async (ctx) => {
        const user = await ctx.runQuery(api.users.getCurrentUser);

        // get all groups
        const allGroups = await ctx.db.query("groups").collect();

        // filter groups where the user is a member
        const groups = allGroups.filter((group) => 
            group.members.some((member) => member.userId === user._id)
        );

        const  enhancedGroups = await Promise.all(
            groups.map(async (group) => {
                // get all expenses for this group
                const expenses = await ctx.db
                    .query("expenses")
                    .withIndex("by_groupId", (q) => q.eq("groupId", group._id))
                    .collect();
                
                let balance = 0;

                // Calculate balance from expenses
                expenses. forEach((expense) => {
                    if (expense.paidByUserId === user._id) {
                        // User paid for the expense - others may owe them
                        expense.splits.forEach((split) =>{
                            // Add amounts others owe to the user (excluding user's own split and paid splits)
                            if (split.userId !== user._id && !split.paid) {
                                balance += split.amount;
                            }
                        });
                    } else {
                        // Someone else paid - user may owe them
                        const userSplit = expense.splits.find(
                            (split) => split.userId === user._id
                        );

                        // Subtract amounts the user owes others
                        if (userSplit && !userSplit.paid) {
                            balance -= userSplit.amount;
                        }
                    }
                });

                // Apply settlements to adjust the balance
                const settlements = await ctx.db
                    .query("settlements")
                    .filter((q) =>
                        q.and(
                            q.eq(q.field("groupId"), group._id),
                            q.or(
                                q.eq(q.field("paidByUserId"), user._id),
                                q.eq(q.field("receivedByUserId"), user._id)
                            )
                        )
                    )
                    .collect();

                settlements.forEach((settlement) => {
                    if (settlement.paidByUserId === user._id) {
                        // User paid someone else - reduce what user is owed
                        balance -= settlement.amount;
                    } else {
                        // Someone paid user - reduce what they owe user
                        balance += settlement.amount;
                    }
                });

                return {
                    ...group,
                    id: group._id,
                    balance,
                };
            })
        );

        return enhancedGroups;
    }
})