 "use client";

import { Label } from "@/components/ui/label";

const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Travel", "Other"];

export default function CategorySelector({ category, onCategoryChange }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" value={category} onChange={(event) => onCategoryChange(event.target.value)} className="h-9 w-full rounded-lg border border-[#ead8ef] bg-[#fffaff] px-3 text-sm">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
        </div>
    );
}