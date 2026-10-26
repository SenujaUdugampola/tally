"use client";

import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";
import { Button } from "@/components/ui/button";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CategorySelector from "./components/categorySelector";
import ExpenseForm from "./components/expenseForm";
import GroupSelector from "./components/groupSelector";
import ParticipantSelector from "./components/participantSelector";
import SplitSelector from "./components/splitSelector";

const roundCents = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export default function NewExpensePage() {
    const router = useRouter();
    const [expenseType, setExpenseType] = useState("group");
    const [groupId, setGroupId] = useState("");
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Other");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [paidByUserId, setPaidByUserId] = useState("");
    const [splitType, setSplitType] = useState("equal");
    const [manualSplits, setManualSplits] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: currentUser, loading: currentUserLoading } = useConvexQuery(api.users.getCurrentUser);
    const { data: groupData, loading: groupsLoading } = useConvexQuery(
        api.groups.getGroupMembers,
        { groupId: groupId || undefined }
    );
    const { data: searchResults, loading: searchLoading } = useConvexQuery(
        api.users.searchUsers,
        { query: searchQuery }
    );
    const createExpense = useConvexMutation(api.expenses.createExpense);

    const groupOptions = useMemo(
        () => (groupData?.groups || []).map((group) => ({
            ...group,
            name: group.name || (
                group.id === groupData?.selectedGroup?.id
                    ? groupData.selectedGroup.name
                    : "Group"
            ),
        })),
        [groupData]
    );

    const participants = useMemo(() => {
        const members = expenseType === "group"
            ? groupData?.selectedGroup?.members || []
            : selectedFriend ? [selectedFriend] : [];
        if (!currentUser) return members;
        return [
            currentUser,
            ...members.filter((member) => member.id !== currentUser._id && member.id !== currentUser.id),
        ];
    }, [currentUser, expenseType, groupData, selectedFriend]);

    const total = Number(amount) || 0;
    const splits = useMemo(() => {
        if (!participants.length) return [];
        if (splitType === "equal") {
            const cents = Math.floor((total * 100) / participants.length);
            let remainder = Math.round(total * 100) - cents * participants.length;
            return participants.map((participant) => ({
                userId: participant.id || participant._id,
                amount: (cents + (remainder-- > 0 ? 1 : 0)) / 100,
                paid: (participant.id || participant._id) === paidByUserId,
            }));
        }
        return participants.map((participant) => {
            const userId = participant.id || participant._id;
            const enteredValue = Number(manualSplits[userId]) || 0;
            return {
                userId,
                amount: splitType === "percentage"
                    ? roundCents((total * enteredValue) / 100)
                    : roundCents(enteredValue),
                paid: userId === paidByUserId,
            };
        });
    }, [manualSplits, paidByUserId, participants, splitType, total]);

    const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
    const enteredPercentageTotal = participants.reduce(
        (sum, participant) => sum + (Number(manualSplits[participant.id || participant._id]) || 0),
        0
    );
    const splitIsValid = splitType === "percentage"
        ? Math.abs(enteredPercentageTotal - 100) <= 0.01
        : Math.abs(splitTotal - total) <= 0.01;
    const canSubmit = Boolean(
        currentUser && description.trim() && total > 0 && date && participants.length &&
        paidByUserId && splitIsValid && (expenseType === "individual" || groupId)
    );

    const selectGroup = (value) => {
        setGroupId(value);
        setSelectedFriend(null);
        setPaidByUserId(currentUser?._id || "");
        setManualSplits({});
    };

    const selectFriend = (friend) => {
        setSelectedFriend(friend);
        setGroupId("");
        setPaidByUserId(currentUser?._id || "");
        setManualSplits({});
        setSelectorOpen(false);
    };

    const setType = (value) => {
        setExpenseType(value);
        setGroupId("");
        setSelectedFriend(null);
        setManualSplits({});
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (!canSubmit) {
            toast.error(!participants.length
                ? "Select a group or participant first."
                : "Enter an amount and make sure the split matches it.");
            return;
        }
        setIsSubmitting(true);
        try {
            const expenseId = await createExpense.mutate({
                description: description.trim(),
                amount: roundCents(total),
                category,
                date: new Date(`${date}T00:00:00`).getTime(),
                paidByUserId,
                splitType,
                splits,
                groupId: expenseType === "group" ? groupId : undefined,
            });
            if (expenseId) {
                toast.success("Expense added successfully!");
                router.back();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (currentUserLoading || !currentUser) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoaderCircle className="size-8 animate-spin text-[#CB6CE7]" />
                <span className="sr-only">Loading expense form</span>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] px-4 pb-12 sm:px-10">
            <div className="mx-auto w-full max-w-[60rem]">
                <Button onClick={() => router.back()} variant="ghost" className="mb-5 pl-0 text-muted-foreground hover:bg-transparent hover:text-[#a23bc3]">
                    <ArrowLeft /> Back
                </Button>
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm sm:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Add expense</h1>
                        <p className="mt-1 text-muted-foreground">Track a shared expense with your group or a friend.</p>
                    </div>

                    <div className="space-y-8">
                        <GroupSelector
                            expenseType={expenseType}
                            onExpenseTypeChange={setType}
                            groupId={groupId}
                            onGroupChange={selectGroup}
                            groups={groupOptions}
                            selectedGroup={groupData?.selectedGroup}
                            groupsLoading={groupsLoading}
                        />
                        <ParticipantSelector
                            expenseType={expenseType}
                            selectedFriend={selectedFriend}
                            onSelectFriend={selectFriend}
                            onRemoveFriend={() => setSelectedFriend(null)}
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            selectorOpen={selectorOpen}
                            onSelectorOpenChange={setSelectorOpen}
                            searchResults={searchResults}
                            searchLoading={searchLoading}
                        />
                        <ExpenseForm
                            description={description}
                            onDescriptionChange={setDescription}
                            amount={amount}
                            onAmountChange={setAmount}
                            date={date}
                            onDateChange={setDate}
                        />
                        <CategorySelector category={category} onCategoryChange={setCategory} />
                        <SplitSelector
                            participants={participants}
                            currentUser={currentUser}
                            paidByUserId={paidByUserId}
                            onPaidByChange={setPaidByUserId}
                            splitType={splitType}
                            onSplitTypeChange={setSplitType}
                            splits={splits}
                            manualSplits={manualSplits}
                            onManualSplitChange={(userId, value) => setManualSplits((previous) => ({ ...previous, [userId]: value }))}
                            splitTotal={splitTotal}
                            total={total}
                            percentageTotal={enteredPercentageTotal}
                            splitIsValid={splitIsValid}
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={!canSubmit || isSubmitting} className="bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white">
                            {isSubmitting && <LoaderCircle className="animate-spin" />}
                            Save expense
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
