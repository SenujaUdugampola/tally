"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import SettlementForm from "./components/settlementForm";

const SettlementPage = () => {
    const params = useParams();
    const router = useRouter();
    const type = Array.isArray(params.type) ? params.type[0] : params.type;
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const decodedId = rawId ? decodeURIComponent(rawId) : rawId;
    const entityId = decodedId?.includes("=")
        ? decodedId.slice(decodedId.indexOf("=") + 1)
        : decodedId;
    const entityType = type === "person" ? "user" : type;
    const { data, loading, error } = useConvexQuery(
        api.settlements.getSettlementData,
        { entityType, entityId }
    );
    const { data: currentUser, loading: currentUserLoading } = useConvexQuery(api.users.getCurrentUser);
    const createSettlement = useConvexMutation(api.settlements.createSettlement);

    const isValidType = type === "person" || type === "group";
    const isLoading = loading || currentUserLoading;
    const normalizedData = useMemo(() => {
        if (!data) return null;
        return {
            ...data,
            balances: data.balances?.filter((balance) => balance.youOwe > 0) ?? [],
        };
    }, [data]);

    const handleSubmit = async ({ amount, note, paidByUserId, receivedByUserId, groupId }) => {
        try {
            const result = await createSettlement.mutate({
                amount,
                note: note || undefined,
                paidByUserId,
                receivedByUserId,
                groupId: groupId || undefined,
            });
            if (!result) {
                throw new Error("The payment could not be recorded.");
            }
            toast.success("Payment recorded successfully!");
            router.back();
            return true;
        } catch (submitError) {
            toast.error(submitError.message || "Could not record the payment.");
            return false;
        }
    };

    if (!isValidType || isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoaderCircle className="size-8 animate-spin text-[#CB6CE7]" />
                <span className="sr-only">Loading settlement form</span>
            </div>
        );
    }

    if (error || !normalizedData || !currentUser) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6 text-center">
                <div>
                    <h1 className="text-xl font-semibold">Unable to load settlement details</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error?.message || "Please go back and try again."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <SettlementForm
            type={type}
            data={normalizedData}
            currentUser={currentUser}
            submitting={createSettlement.loading}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
        />
    );
};

export default SettlementPage;