 "use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExpenseForm({ description, onDescriptionChange, amount, onAmountChange, date, onDateChange }) {
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(event) => onDescriptionChange(event.target.value)} placeholder="Dinner at Joe&apos;s" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => onAmountChange(event.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
            </div>
        </div>
    );
}