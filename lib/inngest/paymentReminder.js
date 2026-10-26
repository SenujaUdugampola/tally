import { ConvexHttpClient } from "convex/browser";
import { inngest, email } from "./client";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const paymentReminder = inngest.createFunction(
  {
    id: "send-payment-reminder",
    triggers: [{ cron: "0 9 * * *" }]
  }, // Every day at 9am
  async ({ step }) => {
    //fetch all users that still owes money
    const users = await step.run("fetch-debts", () =>
      convex.query(api.inngest.getUsersWithOutstandingDebts)
    )

    const results = await step.run("send-emails", async () => {
      return Promise.all(
        users.map(async (u) => {
          const rows = u.debts
            .map(
              (d) => `
                <tr>
                  <td style="padding:4px 8px;">${d.name}</td>
                  <td style="padding:4px 8px;">$${d.amount.toFixed(2)}</td>
                </tr>
              `
            )
            .join("")

          if (!rows) return { userId: u._id, skipped: true }

          const html = `
            <h2>Tally - Payment Reminder</h2>
            <p>Hi ${u.name}, you have the following outstanding balances :</p>
            <table cellspacing="0" cellpadding="0" border="1"
            style="border-collapse:collapse;">
              <thead>
                <tr><th>To</th><th>Amount</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p>Please settle up soon. Thanks !</p>
          `;

          try {
            await convex.action(api.email.sendEmail, {
              to: u.email,
              subject: "You have pending payments on Tally",
              html,
              apikey: process.env.RESEND_API_KEY,
            })

            return { userId: u._id, success: true }
          } catch (error) {
            return { userId: u._id, success: false, error: error.message }
          }
        })
      )

    })
    return {
      processed: results.length,
      sucesses: results.filter((r) => r.success).length,
      failures: results.filter((r) => r.success === false).length
    }
  }
)