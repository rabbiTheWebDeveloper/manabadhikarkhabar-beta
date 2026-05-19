import { NextResponse } from "next/server";
import { generateMonthlyBillings, markOverdueBillings } from "@/queries/billing";

/**
 * GET /api/cron/billing
 *
 * Trigger this endpoint via a cron job (e.g. Vercel Cron, cron-job.org, GitHub Actions).
 * Secured with CRON_SECRET env variable.
 *
 * Example Vercel cron (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/billing", "schedule": "0 0 * * *" }]
 * }
 */
export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Mark overdue bills first
    const overdueCount = await markOverdueBillings();

    // 2. Generate new monthly bills for all due shops
    const { created, errors } = await generateMonthlyBillings();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overdueMarked: overdueCount,
      billsCreated: created,
      errors,
    });
  } catch (error) {
    console.error("[CRON/BILLING] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
