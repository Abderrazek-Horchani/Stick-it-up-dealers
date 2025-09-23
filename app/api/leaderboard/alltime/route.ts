import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';




export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all-time sales totals for each dealer
    const allTimeSales = await prisma.salesRecord.groupBy({
      by: ['dealerId'],
      _sum: {
        amount: true,
        earnings: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 10
    });

    // Get dealer names
    const dealerIds = allTimeSales.map((record: { dealerId: string }) => record.dealerId);
    const dealers = await Promise.all(
      dealerIds.map((id: string) => clerkClient.users.getUser(id))
    );

    const leaderboard = allTimeSales.map((entry: { dealerId: string; _sum: { amount: number | null; earnings: number | null } }, index: number) => ({
      dealerId: entry.dealerId,
      dealerName: dealers.find(d => d.id === entry.dealerId)?.firstName || 'Unknown',
      totalSales: entry._sum.amount || 0,
      totalEarnings: entry._sum.earnings || 0,
      rank: index + 1
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching all-time leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}