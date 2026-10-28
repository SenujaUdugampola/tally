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
    const balances = data.balances ?? [];
    const [selectedUserId, setSelectedUserId] = useState(balances[0]?.userId ?? "");
    const selectedBalance = balances.find((balance) => balance.userId === selectedUserId);
    const initialAmount = isGroup ? selectedBalance?.youOwe ?? 0 : data.youOwe ?? 0;
    const [amount, setAmount] = useState(String(initialAmount || ""));
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState("");

    const recipient = isGroup ? selectedBalance : counterpart;
    const recipientId = isGroup ? selectedBalance?.userId : counterpart?.userId;
    const canSubmit = Boolean(currentUser?._id && recipientId && Number(amount) > 0 && Number.isFinite(Number(amount)));
    const balanceText = useMemo(() => {
        if (isGroup) return `${formatMoney(selectedBalance?.youOwe)} owed to ${recipient?.name ?? "this member"}`;
        if (data.youOwe > 0) return `You owe ${counterpart.name} ${formatMoney(data.youOwe)}`;
        if (data.youAreOwed > 0) return `${counterpart.name} owes you ${formatMoney(data.youAreOwed)}`;
        return "You are all settled up";
    }, [counterpart, data, isGroup, recipient, selectedBalance]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSubmit || submitting) {
            toast.error("Enter a valid payment amount and select a recipient.");
            return;
        }
        await onSubmit({
            amount: Math.round(Number(amount) * 100) / 100,
            note: note.trim(),
            paidByUserId: currentUser._id,
            receivedByUserId: recipientId,
            groupId: isGroup ? data.group?.id : undefined,
        });
    };

    const handleRecipientChange = (userId) => {
        setSelectedUserId(userId);
        const balance = balances.find((item) => item.userId === userId);
        setAmount(String(balance?.youOwe || ""));
    };

    return (
        <div className="min-h-[80vh] px-4 pb-12 sm:px-10">
            <div className="mx-auto w-full max-w-[42rem]">
                <Button onClick={onCancel} variant="ghost" className="mb-5 pl-0 text-muted-foreground hover:bg-transparent hover:text-[#a23bc3]"><ArrowLeft /> Back</Button>
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[#ead8ef] bg-[#fffaff]/90 p-5 shadow-sm sm:p-8">
                    <header className="mb-8 flex items-center gap-4">
                        {isGroup ? (
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b94bdb] to-[#8068e8] text-white"><Users className="size-7" /></div>
                        ) : (
                            <Avatar size="lg" className="ring-4 ring-[#f1c8f7]">
                                <AvatarImage src={counterpart.imageUrl ?? undefined} alt={counterpart.name} />
                                <AvatarFallback className="bg-[#f8ddfb] text-[#a23bc3]">{initials(counterpart.name)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Settle up</h1>
                            <p className="mt-1 text-sm text-muted-foreground">{isGroup ? `Settle balances in ${data.group.name}` : `Settle up with ${counterpart.name}`}</p>
                        </div>
                    </header>

                    <section className="rounded-xl border border-[#ead8ef] bg-white/60 p-4 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <HandCoins className="size-5 text-[#a23bc3]" />
                            <div>
                                <p className="text-sm font-medium">{balanceText}</p>
                                <p className="mt-1 text-xs text-muted-foreground">You are recording a payment from yourself.</p>
                            </div>
                        </div>
                        {isGroup && balances.length > 0 && (
                            <RadioGroup value={selectedUserId} onValueChange={handleRecipientChange} className="mt-4">
                                {balances.map((balance) => (
                                    <label key={balance.userId} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                                        <RadioGroupItem value={balance.userId} />
                                        <Avatar size="sm"><AvatarImage src={balance.imageUrl ?? undefined} alt={balance.name} /><AvatarFallback>{initials(balance.name)}</AvatarFallback></Avatar>
                                        <span className="flex-1 text-sm font-medium">{balance.name}</span>
                                        <span className="text-sm font-semibold text-rose-600">{formatMoney(balance.youOwe)}</span>
                                    </label>
                                ))}
                            </RadioGroup>
                        )}
                    </section>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="settlement-amount">Amount</Label><Input id="settlement-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></div>
                        <div className="space-y-2"><Label htmlFor="settlement-date">Date</Label><Input id="settlement-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></div>
                        <div className="space-y-2 sm:col-span-2"><Label htmlFor="settlement-note">Note <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="settlement-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Venmo'd you for dinner" rows={3} /></div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={!canSubmit || submitting} className="bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white">{submitting && <LoaderCircle className="animate-spin" />}Record payment</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}