 "use client";

import { Label } from "@/components/ui/label";

export default function GroupSelector({ expenseType, onExpenseTypeChange, groupId, onGroupChange, groups, selectedGroup, groupsLoading }) {
    const selectedGroupFromList = groups.find((group) => group.id === groupId);
    const selectedGroupName = selectedGroup?.name || selectedGroupFromList?.name;
    return (
        <div className="space-y-5">
            <div>
                <Label className="mb-2 block">Expense type</Label>
                <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
                    {[["group", "Group expense"], ["individual", "Individual expense"]].map(([value, label]) => (
                        <button key={value} type="button" onClick={() => onExpenseTypeChange(value)} className={`rounded-md px-3 py-2 text-sm font-medium transition ${expenseType === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            {expenseType === "group" && (
                <div className="space-y-2">
                    <Label htmlFor="group">Group</Label>
                    <select id="group" value={groupId} onChange={(event) => onGroupChange(event.target.value)} className="h-9 w-full rounded-lg border border-[#ead8ef] bg-[#fffaff] px-3 text-sm" disabled={groupsLoading}>
                        <option value="">{groupsLoading ? "Loading groups..." : "Select a group"}</option>
                        {groups.map((group) => <option key={group.id} value={group.id}>{group.name || (group.id === groupId ? selectedGroupName : "Group")}</option>)}
                    </select>
                    {selectedGroupName && <p className="text-xs text-muted-foreground">Selected group: {selectedGroupName}</p>}
                </div>
            )}
        </div>
    );
}