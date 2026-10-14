"use client"

import { api } from "@/convex/_generated/api"
import { useConvexQuery } from "@/hooks/useConvexQuery"
import {
  Users,
  UserPlus,
  UserRoundPlus,
  LoaderCircle,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import CreateGroupModal from "./_components/creategroupModal"
import { useState } from "react"
import { useRouter } from "next/navigation"

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?"

const EmptyState = ({ type, onAction }) => {
  const isFriends = type === "friends"
  const Icon = isFriends ? UserPlus : Users

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#b94bdb]/25 bg-white/70 px-6 py-16 text-center dark:bg-white/5">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b94bdb]/20 to-[#6c63ff]/20 text-[#b94bdb]">
        <Icon className="size-6" />
      </div>
      <h2 className="text-lg font-semibold">
        {isFriends ? "No friends yet" : "No groups yet"}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {isFriends
          ? "You haven't added any friends yet."
          : "Create a group to start sharing expenses together."}
      </p>
      <Button
        className="mt-6 border-[#b94bdb]/40 text-[#a23bc3] hover:bg-[#b94bdb]/10 hover:text-[#8e2eac]"
        variant="outline"
        onClick={onAction}
      >
        {isFriends ? "Add a friend" : "Create a group"}
      </Button>
    </div>
  )
}

const ContactsPage = () => {
  const [isCreatingGroupModalOpen, setIsCreatingGroupModalOpen] = useState(false)
  const { data, loading } = useConvexQuery(api.contacts.getAllContacts)
  const users = data?.users ?? []
  const groups = data?.groups ?? []
  const router = useRouter();

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-12">
        <LoaderCircle className="size-8 animate-spin text-[#CB6CE7]" />
        <span className="sr-only">Loading contacts</span>
      </div>
    )
  }

  return (
    <div className="relative min-h-[80vh] overflow-hidden px-4 sm:px-10 dark:from-[#21152a] dark:via-background dark:to-[#16152b]">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full" />
      <div className="container relative mx-auto">
        <div className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/65 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-white/10 dark:bg-white/5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#b94bdb]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#a23bc3]">
              <span className="size-1.5 rounded-full bg-[#b94bdb]" />
              Your circle
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Contacts
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Manage the people and groups you share expenses with.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* <Button
              size="lg"
              className="h-11 px-5 bg-white text-[#a23bc3] ring-1 ring-[#b94bdb]/25 hover:bg-[#fff5ff] focus-visible:ring-[#b94bdb] dark:bg-white/10 dark:text-[#e2a5ef] dark:hover:bg-white/15"
            >
              <UserRoundPlus />
              Add Friend
            </Button> */}
            <Button
              size="lg"
              className="h-11 px-5 bg-gradient-to-r from-[#b94bdb] to-[#8068e8] text-white hover:from-[#a941c5] hover:to-[#7058d5] focus-visible:ring-[#b94bdb]"
              onClick={() => setIsCreatingGroupModalOpen(true)}
            >
              <Users />
              Create Group
            </Button>
          </div>
        </div>

        <Tabs defaultValue="friends" className="mt-2">
          <TabsList variant="line">
            <TabsTrigger value="friends" className="px-8 py-2">
              <UserPlus />
              Friends
            </TabsTrigger>
            <TabsTrigger value="groups" className="px-8 py-2">
              <Users />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            {users.length === 0 ? (
              <EmptyState type="friends" />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((user, index) => (
                  <Card
                    key={user.id}
                    className="group overflow-hidden border border-[#ead8ef] bg-white/75 transition-colors hover:border-[#b94bdb]/50 hover:bg-[#fff8ff] dark:border-white/10 dark:bg-white/5 dark:hover:border-[#b94bdb]/50 dark:hover:bg-white/10"
                  >
                    <div className={`h-1 w-full ${index % 2 === 0 ? "bg-gradient-to-r from-[#b94bdb] to-[#f0a5e8]" : "bg-gradient-to-r from-[#6475e8] to-[#a99af5]"}`} />
                    <CardContent className="flex items-center gap-4 p-5">
                      <Avatar size="lg" className={`transition-transform group-hover:scale-105 ${index % 2 === 0 ? "ring-4 ring-[#f1c8f7]" : "ring-4 ring-[#d7d9ff]"}`}>
                        <AvatarImage src={user.imageUrl ?? undefined} alt={user.name} />
                        <AvatarFallback className={index % 2 === 0 ? "bg-[#f8ddfb] text-[#a23bc3]" : "bg-[#e3e4ff] text-[#5d5dc5]"}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">{user.name}</CardTitle>
                        <CardDescription className="mt-1 truncate text-xs">
                          {user.email}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            {groups.length === 0 ? (
              <EmptyState type="groups" />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group, index) => (
                  <Card
                    key={group.id}
                    className="group overflow-hidden border border-[#dfe0f5] bg-white/75 transition-colors hover:border-[#8068e8]/55 hover:bg-[#f8f7ff] dark:border-white/10 dark:bg-white/5 dark:hover:border-[#8068e8]/55 dark:hover:bg-white/10"
                  >
                    <div className={`h-1 w-full ${index % 2 === 0 ? "bg-gradient-to-r from-[#e177d8] to-[#b94bdb]" : "bg-gradient-to-r from-[#9a72e8] to-[#6475e8]"}`} />
                    <CardHeader className="flex-row items-center gap-4 p-5 pb-3">
                      <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-white transition-transform group-hover:scale-105 ${index % 2 === 0 ? "bg-gradient-to-br from-[#b94bdb] to-[#e177d8]" : "bg-gradient-to-br from-[#6475e8] to-[#9a72e8]"}`}>
                        <Users className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">{group.name}</CardTitle>
                        <CardDescription className="mt-1 text-xs font-medium uppercase tracking-wide">
                          {group.memberCount}{" "}
                          {group.memberCount === 1 ? "member" : "members"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    {group.description ? (
                      <CardContent className="border-t border-[#edeafa] px-5 pb-5 pt-3 text-sm text-muted-foreground dark:border-white/10">
                        {group.description}
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        <CreateGroupModal 
          isOpen={isCreatingGroupModalOpen}
          onClose={() => setIsCreatingGroupModalOpen(false)}
          // onSuccess={(groupId) => router.push(`/groups/${groupId}`)}
        />
      </div>
    </div>
  )
}

export default ContactsPage