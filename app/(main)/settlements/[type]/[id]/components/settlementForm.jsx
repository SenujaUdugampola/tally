"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, HandCoins, LoaderCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const formatMoney = (amount) => currency.format(Math.abs(amount ?? 0));
const initials = (name = "") =>
    name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

export default function SettlementForm({ type, data, currentUser, submitting, onSubmit, onCancel }) {
    const isGroup = type === "group";
    const counterpart = data.counterpart;
    const balances = useMemo(() => data.balances ?? [], [data.balances]);
    const memberOptions = useMemo(() => {
        if (!isGroup) {
            return counterpart ? [{
                userId: counterpart.userId,
                name: counterpart.name,
                imageUrl: counterpart.imageUrl,
                netBalance: (data.youAreOwed ?? 0) - (data.youOwe ?? 0),
                youOwe: data.youOwe ?? 0,
                youAreOwed: data.youAreOwed ?? 0,
            }] : [];
        }

        return balances.filter((member) => member.userId !== currentUser?._id);
    }, [balances, counterpart, currentUser, data, isGroup]);

    const defaultRecipient = isGroup
        ? (balances.find((balance) => balance.userId !== currentUser?._id) ?? balances[0] ?? null)
        : counterpart;
    const initialAmount = isGroup
        ? (defaultRecipient ? (defaultRecipient.youOwe > 0 ? defaultRecipient.youOwe : defaultRecipient.youAreOwed || defaultRecipient.netBalance || 0) : 0)
        : (data.youOwe > 0 ? data.youOwe : data.youAreOwed || 0);

    const [selectedUserId, setSelectedUserId] = useState(
        isGroup ? "" : defaultRecipient?.userId ?? defaultRecipient?._id ?? ""
    );
    const [paymentDirection, setPaymentDirection] = useState(() => {
        if (!isGroup) return data.youOwe > 0 ? "me" : "member";
        return defaultRecipient?.youOwe > 0 ? "me" : "member";
    });
    const [amount, setAmount] = useState(String(initialAmount || ""));
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState("");

    const selectedMember = memberOptions.find((member) => member.userId === selectedUserId) ?? null;
    const recipientName = isGroup ? selectedMember?.name ?? "member" : counterpart?.name ?? "person";
    const otherUserId = isGroup ? selectedMember?.userId : counterpart?.userId;
    const payerId = paymentDirection === "me" ? currentUser?._id : otherUserId;
    const receiverId = paymentDirection === "me" ? otherUserId : currentUser?._id;
    const canSubmit = Boolean(
        currentUser?._id &&
        payerId &&
        receiverId &&
        payerId !== receiverId &&
        Number(amount) > 0 &&
        Number.isFinite(Number(amount))
    );
    const balanceText = useMemo(() => {
        if (isGroup) {
            const groupBalance = balances.find((balance) => balance.userId === selectedUserId);
            if (!groupBalance) return "Select a member to settle with";
            if (groupBalance.youOwe > 0) return `You owe ${groupBalance.name} ${formatMoney(groupBalance.youOwe)}`;
            if (groupBalance.youAreOwed > 0) return `${groupBalance.name} owes you ${formatMoney(groupBalance.youAreOwed)}`;
            return `Balance with ${groupBalance.name} is settled`;
        }
        if (data.youOwe > 0) return `You owe ${counterpart.name} ${formatMoney(data.youOwe)}`;
        if (data.youAreOwed > 0) return `${counterpart.name} owes you ${formatMoney(data.youAreOwed)}`;
        return "You are all settled up";
    }, [balances, counterpart, data, isGroup, selectedUserId]);

    const hasSelectedMember = Boolean(selectedMember);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSubmit || submitting) {
            toast.error("Enter a valid payment amount and choose who paid and received it.");
            return;
        }
        await onSubmit({
            amount: Math.round(Number(amount) * 100) / 100,
            note: note.trim(),
            paidByUserId: payerId,
            receivedByUserId: receiverId,
            groupId: isGroup ? data.group?.id : undefined,
        });
    };

    const handleMemberSelect = (userId) => {
        setSelectedUserId(userId);
        const balance = balances.find((item) => item.userId === userId);
        if (balance) {
            setPaymentDirection(balance.youOwe > 0 ? "me" : "member");
            setAmount(String(balance.youOwe > 0 ? balance.youOwe : balance.youAreOwed || balance.netBalance || ""));
            return;
        }

        setPaymentDirection("me");
        setAmount("");
    };

    return (
        <div className="min-h-[80vh] px-4 pb-12 sm:px-10">
            <div className="mx-auto w-full max-w-[60rem]">
                <Button onClick={onCancel} variant="ghost" className="mb-5 pl-0 text-muted-foreground hover:bg-transparent hover:text-[#a23bc3]"><ArrowLeft /> Back</Button>
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm sm:p-8">
                    <header className="mb-8 flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Settlement</h1>
                            <p className="mt-1 text-muted-foreground">{isGroup ? `Settle balances in ${data.group.name}` : `Settle up with ${counterpart.name}`}</p>
                        </div>
                    </header>

                    <section className="rounded-xl border border-[#ead8ef] bg-[#fffaff]/90 p-4 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <HandCoins className="size-5 text-[#a23bc3]" />
                            <div>
                                <p className="text-sm font-medium">{balanceText}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Choose the member and who paid the settlement.</p>
                            </div>
                        </div>

                        {memberOptions.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <Label>{isGroup ? "Select a member" : "Member"}</Label>
                                <RadioGroup value={selectedUserId} onValueChange={handleMemberSelect} className="grid gap-3">
                                    {memberOptions.map((member) => {
                                        const netBalance = member.netBalance ?? ((member.youAreOwed ?? 0) - (member.youOwe ?? 0));
                                        const balanceLabel = netBalance > 0
                                            ? `${member.name} owes you ${formatMoney(netBalance)}`
                                            : netBalance < 0
                                                ? `You owe ${member.name} ${formatMoney(netBalance)}`
                                                : "Settled";
                                        const balanceClass = netBalance > 0
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : netBalance < 0
                                                ? "text-rose-600 dark:text-rose-400"
                                                : "text-muted-foreground";

                                        return (
                                            <label
                                                key={member.userId}
                                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50 ${selectedUserId === member.userId ? "border-[#b94bdb] bg-[#b94bdb]/5" : "border-border"}`}
                                            >
                                                <RadioGroupItem value={member.userId} />
                                                <Avatar size="sm">
                                                    <AvatarImage src={member.imageUrl ?? undefined} alt={member.name} />
                                                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="flex-1 text-sm font-medium">{member.name}</span>
                                                <span className={`text-right text-sm font-semibold ${balanceClass}`}>{balanceLabel}</span>
                                            </label>
                                        );
                                    })}
                                </RadioGroup>
                            </div>
                        )}
                    </section>

                    {hasSelectedMember && <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Settlement direction</Label>
                            <RadioGroup value={paymentDirection} onValueChange={setPaymentDirection} className="grid gap-3 sm:grid-cols-2">
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                                    <RadioGroupItem value="me" />
                                    <span className="text-sm font-medium">You paid {recipientName}</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                                    <RadioGroupItem value="member" />
                                    <span className="text-sm font-medium">{recipientName} paid for me</span>
                                </label>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2"><Label htmlFor="settlement-amount">Amount</Label><Input id="settlement-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></div>
                        <div className="space-y-2"><Label htmlFor="settlement-date">Date</Label><Input id="settlement-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
                        <div className="space-y-2 sm:col-span-2"><Label htmlFor="settlement-note">Note <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="settlement-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder={`Payment for ${recipientName}`} rows={3} /></div>
                    </div>}

                    {hasSelectedMember && <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={!canSubmit || submitting} className="bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white">{submitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}Record payment</Button>
                    </div>}
                </form>
            </div>
        </div>
    );
}