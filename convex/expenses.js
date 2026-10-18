import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";


export const getExpensesBetweenUsers = query({
    args: {userId: v.id("users")},
    handler: async (ctx, { userId }) => {
        const me = await ctx.runQuery(api.users.getCurrentUser);
        if(me.id === userId) throw new Error("Cannot get expenses for yourself");
        
        // one on one expenses
        const myPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) => 
                q.eq("paidByUserId", me._id).eq("groupId", undefined)
            )
            .collect();

        const theirPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) => 
                q.eq("paidByUserId", userId).eq("groupId", undefined)
            )
            .collect();

        const candidateExpenses = [...myPaid, ...theirPaid];

        //keep rows only where both involved
        const expenses = candidateExpenses.filter((expense) => {
            const meInSplits = expense.splits.some((split) => split.userId === me._id);
            const themInSplits = expense.splits.some((split) => split.userId === userId);

            const meInvolved = expense.paidByUserId === me._id || meInSplits;
            const themInvolved = expense.paidByUserId === userId || themInSplits;

            return meInvolved && themInvolved;
        });

        expenses.sort((a, b) => b.date - a.date);

        //settlement between 2
        const settlements = await ctx.db
            .query("settlements")
            .filter((q) =>
                q.and(
                    q.eq(q.field("groupId"), undefined),
                    q.or(
                        q.and(
                            q.eq(q.field("paidByUserId"), me._id),
                            q.eq(q.field("receivedByUserId"), userId)
                        ),
                        q.and(
                            q.eq(q.field("paidByUserId"), userId),
                            q.eq(q.field("receivedByUserId"), me._id)
                        )
                    )
                )
            )
            .collect();

        settlements.sort((a, b) => b.date - a.date);

        //compute current balance
        let balance = 0;

        for await (const expense of expenses) {
            if (expense.paidByUserId === me._id) {
                const split = expense.splits.find((s) => s.userId === userId);
                if (split) {
                    balance += split.amount; // they owe
                }
            } else {
                const split = expense.splits.find((s) => s.userId === me._id);
                if (split) {
                    balance -= split.amount; // I owe
                }
            }
        }

        for (const settlement of settlements) {
            if (settlement.paidByUserId === me._id) {
                balance += settlement.amount; // I paid back
            } else {
                balance -= settlement.amount; // they paid back
            }
        }

        //return payload
        const other = await ctx.db.get(userId);
        if (!other) throw new Error("User not found");

        return {
            expenses,
            settlements,
            balance,
            other: {
                id: other._id,
                name: other.name,
                email: other.email,
                imageUrl: other.imageUrl,
            },
        };

    }
})

export const deleteExpense = mutation({
    args: { expenseId: v.id("expenses") },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser);

        const expense = await ctx.db.get(args.expenseId);
        if (!expense) throw new Error("Expense not found");

        if(expense.createdBy !== user._id && expense.paidByUserId !== user._id) {
            throw new Error("You are not authorized to delete this expense");
        }

        await ctx.db.delete(args.expenseId);

        return { success: true };
    },
})