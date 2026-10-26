import { v } from "convex/values";
import { api } from "./_generated/api";
import { query } from "./_generated/server";

export const getGroupExpenses = query({
    args: { groupId: v.id("groups") },
    handler: async (ctx, { groupId }) => {
        const currentUser = await ctx.runQuery(api.users.getCurrentUser);

        const group = await ctx.db.get(groupId);
        if (!group) throw new Error("Group not found");

        if (!group.members.some((member) => member.userId === currentUser._id)) {
            throw new Error("You are not a member of this group");
        }

        const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_group", (q) => q.eq("groupId", groupId))
            .collect();

        const settlements = await ctx.db
            .query("settlements")
            .filter((q) => q.eq(q.field("groupId"), groupId))
            .collect();

        //memeber map
        const memberDetails = await Promise.all(
            group.members.map(async (member) => {
                const user = await ctx.db.get(member.userId);
                return {
                    id: user._id,
                    name: user.name,
                    imageUrl: user.imageUrl,
                    role: member.role,
                };
            })
        )

        const ids = memberDetails.map((member) => member.id);

        //balace calculation
        const totals = Object.fromEntries(ids.map((id) => [id, 0]));

        //2-d ledger to track who owes who
        // user1 - user2 = 0 , user3 = 0
        // user2 - user1 = 0 , user3 = 0
        const ledger = {}

        ids.forEach((a) => {
            ledger[a] = {}
            ids.forEach((b) => {
                if (a !== b) {
                    ledger[a][b] = 0;
                }
            })
        })

        //apply expenses to balances
        for (const expense of expenses) {
            const payer = expense.paidByUserId;

            for (const split of expense.splits) {
                //skip if own split
                if (split.userId === payer || split.paid) continue;

                const debtor = split.userId;
                const amount = split.amount;

                totals[debtor] -= amount;
                totals[payer] += amount;

                //update ledger
                ledger[debtor][payer] += amount;
            }
        }

        //apply settlements to balances
        for (const settlement of settlements) {
            totals[settlement.paidByUserId] += settlement.amount;
            totals[settlement.receivedByUserId] -= settlement.amount;

            //update ledger
            ledger[settlement.paidByUserId][settlement.receivedByUserId] -= settlement.amount;
        }

        ids.forEach((a) => {
            ids.forEach((b) => {
                if (a >= b) return; // visit each unordered pair once
                const diff = ledger[a][b] - ledger[b][a];
                if (diff > 0) {
                    ledger[a][b] = diff;
                    ledger[b][a] = 0;
                } else if (diff < 0) {
                    ledger[b][a] = -diff;
                    ledger[a][b] = 0;
                } else {
                    ledger[a][b] = ledger[b][a] = 0;
                }
            });
        });

        //format response data
        const balances = memberDetails.map((member) => ({
            ...member,
            totalBalance: totals[member.id],
            owes: Object.entries(ledger[member.id])
                .filter(([, value]) => value > 0)
                .map(([to, amount]) => ({ to, amount })),
            owedBy: ids
                .filter((other) => ledger[other][member.id] > 0)
                .map((other) => ({
                    from: other,
                    amount: ledger[other][member.id]
                })),
        }))

        const userLookupMap = {}
        memberDetails.forEach((member) => {
            userLookupMap[member.id] = member;
        });

        return {
            group: { //froup info
                id: group._id,
                name: group.name,
                description: group.description,
            },
            members: memberDetails, //group - all members info
            expenses, // group - all expenses
            settlements, // group - all settlements
            balances, // group - all members balances
            userLookupMap, // lookup map for user details by id
        };
    }
})

export const getGroupMembers = query({
    args: {
        groupId: v.optional(v.id("groups"))
    },
    handler: async (ctx, args) => {
        const currentUser = await ctx.runQuery(api.users.getCurrentUser)

        //get all groups - user is a member
        const allGroups = await ctx.db.query("groups").collect();
        const userGroups = allGroups.filter((group) =>
            group.members.some((member) => member.userId === currentUser._id)
        );

        if (args.groupId) {
            const selectedGroup = userGroups.find(
                (group) => group._id === args.groupId
            );

            if (!selectedGroup) throw new Error("You are not a member or Group not found");

            const memberDetails = await Promise.all(
                selectedGroup.members.map(async (member) => {
                    const user = await ctx.db.get(member.userId);
                    if (!user) return null;

                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        role: member.role,
                    }
                })
            )

            // Filter out any null values
            const validMembers = memberDetails.filter((member) => member !== null);

            return {
                selectedGroup: {
                    id: selectedGroup._id,
                    name: selectedGroup.name,
                    description: selectedGroup.description,
                    createdBy: selectedGroup.createdBy,
                    members: validMembers,
                },
                groups: userGroups.map((group) => ({
                    id: group._id,
                    name: group._name,
                    description: group.description,
                    memberCount: group.members.length,
                }))
            }
        } else {
            // Just return the list of groups without member details
            return {
                selectedGroup: null,
                groups: userGroups.map((group) => ({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    memberCount: group.members.length,
                })),
            };
        }
    }
})