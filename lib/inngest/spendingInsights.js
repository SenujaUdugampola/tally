import { ConvexHttpClient } from "convex/browser";
import { inngest, email } from "./client";
import { api } from "@/convex/_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { success } from "zod";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" })

export const spendingInsights = inngest.createFunction(
    {
        name: "Generate Spending Insights",
        id: "generating-spending-insights",
        triggers: [{ cron: "0 8 1 * *" }] //1st of every month 8am
    },
    async ({ step }) => {
        //1. Pull users with expenses this month
        const users = await step.run("Fetch users with expenses", async () => {
            return await convex.query(api.inngest.getUsersWithExpenses);
        });

        //2. Iterate users & send insight email
        const results = [];

        for (const user of users) {
            // a. Pull last-month expenses (skip if none)
            const expenses = await step.run(`Expenses . ${user._id}`, () =>
                convex.query(api.inngest.getUserMonthlyExpenses, { userId: user._id })
            )
            if (!expenses?.length) continue;

            const expenseData = JSON.stringify({
                expenses,
                totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
                categories: expenses.reduce((cats, e) => {
                    cats[e.category ?? "uncategorised"] =
                        (cats[e.category] ?? 0) + e.amount
                    return cats
                }, {})
            })

            const prompt = `
            You are a friendly, encouraging financial analyst. Analyze the user's spending data provided in the <expense_data> tags below and provide insightful observations and suggestions.

            Output Requirements:
            - Format the entire response in clean, raw HTML suitable for an email body.
            - Use standard semantic HTML tags (<h2>, <h3>, <p>, <ul>, <li>, <strong>).
            - DO NOT include markdown formatting blocks (e.g., do not wrap the output in \`\`\`html).
            - Keep the tone supportive, actionable, and empathetic.
            
            User spending data:
            ${expenseData}
            
            Structure the email with the following exact sections (use <h3> for section headers):
            1. Monthly Overview
            2. Top Spending Categories
            3. Unusual Spending Patterns (if any)
            4. Saving Opportunities
            5. Recommendations for Next Month
            `.trim();

            try {
                const aiResponse = await step.ai.wrap("gemini", async (p) =>
                    model.generateContent(p),
                    prompt
                )

                const htmlBody = aiResponse.response.candidates[0]?.content.parts[0]?.text ?? ""

                await step.run('Email · ${user._id}', () => {
                    convex.action(api.email.sendEmail, {
                        to: user.email,
                        subject: "Your Monthly Spending Insights",
                        html: `
                            <h1>Your Monthly Financial Insights</h1>
                            <p>Hi ${user.name},</p>
                            <p>Here's your personalized spending analysis for the past month:</p>
                            ${htmlBody}
                        `,
                        apikey: process.env.RESEND_API_KEY,
                    })
                })

                results.push({ userId: user, success: true })
            } catch (error) {
                results.push({
                    userId: user._id,
                    success: false,
                    error: err.message
                })
            }
        }

        return {
            processed: results.length,
            success: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
        };
    }
)