import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";


export const getExpensesBetweenUsers = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const me = await ctx.runQuery(api.users.getCurrentUser);
        if (!me) return null;
        if (me._id === userId) throw new Error("Cannot get expenses for yourself");

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
                balance += settlement.amount; // I paid the friend
            } else {
                balance -= settlement.amount; // the friend paid me
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
            currentUser: {
                id: me._id,
                name: me.name,
                imageUrl: me.imageUrl,
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

        if (expense.createdBy !== user._id && expense.paidByUserId !== user._id) {
            throw new Error("You are not authorized to delete this expense");
        }

        await ctx.db.delete(args.expenseId);

        return { success: true };
    },
})

export const createExpense = mutation({
    args: {
        description: v.string(),
        amount: v.number(),
        category: v.optional(v.string()),
        date: v.number(), // timestamp
        paidByUserId: v.id("users"),
        splitType: v.string(), // "equal", "percentage", "exact"
        splits: v.array(
            v.object({
                userId: v.id("users"),
                amount: v.number(),
                paid: v.boolean(),
            })
        ),
        groupId: v.optional(v.id("groups")),
    },

    handler: async (ctx, args) => {
        const user = await ctx.runQuery(api.users.getCurrentUser);

        if (args.groupId) {
            const group = await ctx.db.get(args.groupId);
            if (!group) throw new Error("Group not found");

            const isMember = group.members.some(
                (member) => member.userId === user._id
            );
            if (!isMember) throw new Error("You are not a member of this group");
        }

        //verify splits add up to toal
        const totalSplitAmount = args.splits.reduce(
            (sum, split) => sum + split.amount, 0
        );

        const tolerance = 0.01; // Allow a small rounding errors
        if (Math.abs(totalSplitAmount - args.amount) > tolerance) {
            throw new Error(`Total split amount does not match expense amount.`);
        }

        const expenseId = await ctx.db.insert("expenses", {
            description: args.description,
            amount: args.amount,
            category: args.category || "Other",
            date: args.date,
            paidByUserId: args.paidByUserId,
            splitType: args.splitType,
            splits: args.splits,
            groupId: args.groupId,
            createdBy: user._id,
        });

        return expenseId;
    }
})