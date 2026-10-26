 "use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

export default function SplitSelector({ participants, currentUser, paidByUserId, onPaidByChange, splitType, onSplitTypeChange, splits, manualSplits, onManualSplitChange, splitTotal, total, percentageTotal, splitIsValid }) {
    return (
        <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="paidBy">Paid by</Label>
                    <select id="paidBy" value={paidByUserId} onChange={(event) => onPaidByChange(event.target.value)} className="h-9 w-full rounded-lg border border-[#ead8ef] bg-[#fffaff] px-3 text-sm" disabled={!participants.length}>
                        {participants.map((participant) => {
                            const userId = participant.id || participant._id;
                            return <option key={userId} value={userId}>{userId === currentUser._id ? `${participant.name} (You)` : participant.name}</option>;
                        })}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="splitType">Split</Label>
                    <select id="splitType" value={splitType} onChange={(event) => onSplitTypeChange(event.target.value)} className="h-9 w-full rounded-lg border border-[#ead8ef] bg-[#fffaff] px-3 text-sm" disabled={!participants.length}>
                        <option value="equal">Equal</option><option value="exact">Exact amounts</option><option value="percentage">Percentage</option>
                    </select>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Participant splits</Label>
                    <span className={`text-sm ${splitIsValid ? "text-emerald-600" : "text-rose-600"}`}>{splitType === "percentage" ? `${percentageTotal.toFixed(2)}% / 100%` : `${money.format(splitTotal)} / ${money.format(total)}`}</span>
                </div>
                {!participants.length ? <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">Choose a group or friend to configure the split.</p> : participants.map((participant) => {
                    const userId = participant.id || participant._id;
                    const value = splits.find((split) => split.userId === userId)?.amount || 0;
                    const percentage = Number(manualSplits[userId]) || 0;
                    return (
                        <div key={userId} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Avatar className="size-8"><AvatarImage src={participant.imageUrl} /><AvatarFallback>{initials(participant.name)}</AvatarFallback></Avatar>
                                    <span className="truncate text-sm">{participant.name}{userId === currentUser._id ? " (You)" : ""}</span>
                                </div>
                                {splitType === "equal" ? <span className="text-sm font-medium">{money.format(value)}</span> : <Input className="w-28 text-right" type="number" min="0" max={splitType === "percentage" ? "100" : undefined} step="0.01" value={manualSplits[userId] ?? ""} onChange={(event) => onManualSplitChange(userId, event.target.value)} placeholder={splitType === "percentage" ? "0%" : "0.00"} />}
                            </div>
                            {splitType === "percentage" && (
                                <div className="mt-4 flex items-center gap-3">
                                    <Slider min={0} max={100} step={1} value={[percentage]} onValueChange={(nextValue) => onManualSplitChange(userId, Array.isArray(nextValue) ? nextValue[0] : nextValue)} />
                                    <span className="w-12 text-right text-sm tabular-nums">{percentage}%</span>
                                    <span className="w-24 text-right text-sm font-medium tabular-nums">
                                        {money.format(value)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {splitType === "percentage" && <p className="text-xs text-muted-foreground">Use the sliders or inputs. Percentages must total 100%.</p>}
            </div>
        </div>
    );
}