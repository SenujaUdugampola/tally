import { query, mutation } from './_generated/server';
import { api } from './_generated/api';
import { v } from 'convex/values';

export const getAllContacts=query({
    handler:async (ctx) => {
        const currentUser = await ctx.runQuery(api.users.getCurrentUser);

        // Get all expenses that you have paid
        const expensesYouPaid = await ctx.db
            .query("expenses")
            .withIndex("by_user_and_group", (q) => 
                q.eq("paidByUserId", currentUser._id).eq("groupId", undefined)
            )
            .collect();

        // Get all expenses that you have not paid
        const expensesNotPaidByYou = (await ctx.db
            .query("expenses")
            .withIndex("by_group", (q) => q.eq("groupId", undefined))
            .collect()
        ).filter(
            (e) => 
                e.paidByUserId !== currentUser._id && 
                e.splits.some((s) => s.userId === currentUser._id)
        );

        const personalExpenses = [...expensesYouPaid, ...expensesNotPaidByYou];

        const contactIds = new Set();
        personalExpenses.forEach((expense) => {
            if (expense.paidByUserId !== currentUser._id) {
                contactIds.add(expense.paidByUserId);
            }

            //add all the users in the splits of the expense to the contactIds set, except for the current user
            expense.splits.forEach((split) => {
                if (split.userId !== currentUser._id) {
                    contactIds.add(split.userId);
                }
            });
        });

        const contactUsers = await Promise.all(
            [...contactIds].map(async (id) => {
                const user = await ctx.db.get(id);

                return user
                    ? {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        type: "user", // to distinguish between user and group
                        }
                    : null;
            })
        );

        const userGroups = (await ctx.db.query("groups").collect()).filter((group) =>
            group.members.some((member) => member.userId === currentUser._id))
            .map((group) => ({
                id: group._id,
                name: group.name,
                description: group.description,
                memberCount: group.members.length,
                type: "group", // to distinguish between user and group
            })
        );

        // sort results alphabetically by name
        contactUsers.sort((a, b) => a?.name.localeCompare(b?.name));
        userGroups.sort((a, b) => a.name.localeCompare(b.name));

        // return results, filtering out null values from contactUsers
        return {
            users: contactUsers.filter(Boolean),
            groups: userGroups,
        };
    },
});

export const createGroup=mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        members: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const currentUser = await ctx.runQuery(api.users.getCurrentUser);

        if (!args.name.trim()) {
            throw new Error("Group name cannot be empty");
        }

        const uniqueMembers = new Set(args.members);
        uniqueMembers.add(currentUser._id); // Ensure the current user is always a member\

        for (const id of uniqueMembers) {
            if(!(await ctx.db.get(id))) {
                throw new Error(`User with ID ${id} does not exist`);
            }
        }

        return await ctx.db.insert("groups", {
            name: args.name.trim(),
            description: args.description?.trim() ?? "",
            createdBy: currentUser._id,
            members: [...uniqueMembers].map((id) => ({
                userId: id,
                role: id === currentUser._id ? "admin" : "member",
                joinedAt: Date.now(),
            })),
        });
    }
});