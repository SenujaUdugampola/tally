 "use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UserPlus, X } from "lucide-react";

const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";

export default function ParticipantSelector({ expenseType, selectedFriend, onSelectFriend, onRemoveFriend, searchQuery, onSearchQueryChange, selectorOpen, onSelectorOpenChange, searchResults, searchLoading }) {
    if (expenseType === "group") return null;
    return (
        <div className="space-y-2">
            <Label>Friend or contact</Label>
            {selectedFriend ? (
                <Badge variant="secondary" className="min-h-11 w-fit gap-3 rounded-xl border border-[#ead8ef] bg-[#fffaff] px-4 py-2.5 text-base shadow-sm">
                    <Avatar className="size-7"><AvatarImage src={selectedFriend.imageUrl} /><AvatarFallback>{initials(selectedFriend.name)}</AvatarFallback></Avatar>
                    <span>{selectedFriend.name}</span>
                    <button type="button" onClick={onRemoveFriend} aria-label="Remove friend" className="ml-1 rounded-full p-1 hover:bg-muted"><X className="size-4" /></button>
                </Badge>
            ) : (
                <Popover open={selectorOpen} onOpenChange={onSelectorOpenChange}>
                    <PopoverTrigger render={<Button type="button" variant="outline" className="h-10 w-full justify-start border-[#ead8ef] bg-[#fffaff] text-muted-foreground" />}><UserPlus /> Search by name or email</PopoverTrigger>
                    <PopoverContent className="border-[#ead8ef] bg-[#fffaff] p-0" align="start">
                        <Command className="bg-[#fffaff]">
                            <CommandInput placeholder="Search by name or email..." value={searchQuery} onValueChange={onSearchQueryChange} />
                            <CommandList>
                                <CommandEmpty>{searchQuery.length < 2 ? "Type at least 2 characters to search." : searchLoading ? "Searching..." : "No users found."}</CommandEmpty>
                                <CommandGroup>
                                    {searchResults?.map((user) => (
                                        <CommandItem key={user.id} value={`${user.name} ${user.email}`} onSelect={() => onSelectFriend(user)}>
                                            <Avatar className="size-6"><AvatarImage src={user.imageUrl} /><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                                            <span>{user.name}</span><span className="text-xs text-muted-foreground">{user.email}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}