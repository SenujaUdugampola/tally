import { inngest } from "@/lib/inngest/client";
import { paymentReminder } from "@/lib/inngest/paymentReminder";
import { spendingInsights } from "@/lib/inngest/spendingInsights";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    paymentReminder,
    spendingInsights
  ],
});