import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';




function getWeekNumber(date: Date): { week: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { week, year: date.getFullYear() };
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentDate = new Date();
    const { week, year } = getWeekNumber(currentDate);

    const weeklyPerformance = await prisma.weeklyPerformance.findMany({
      where: {
        week,
        year
      },
      orderBy: {
        totalSales: 'desc'
      },
      take: 10
    });

    // Get dealer names
    const dealerIds = weeklyPerformance.map((wp: { dealerId: string }) => wp.dealerId);
    const dealers = await Promise.all(
      dealerIds.map((id: string) => clerkClient.users.getUser(id))
    );

    const leaderboard = weeklyPerformance.map((entry: { dealerId: string; totalSales: number; totalEarnings: number }, index: number) => ({
      dealerId: entry.dealerId,
      dealerName: dealers.find(d => d.id === entry.dealerId)?.firstName || 'Unknown',
      totalSales: entry.totalSales,
      totalEarnings: entry.totalEarnings,
      rank: index + 1
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching weekly leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}