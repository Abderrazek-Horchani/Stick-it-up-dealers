import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';


interface DealerRecord {
  id: string;
  name: string;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WeeklyStats {
  totalAmount: number | null;
  totalEarnings: number | null;
}

interface WeeklyPerformance {
  id: string;
  dealerId: string;
  week: number;
  year: number;
  totalSales: number;
  totalEarnings: number;
  rank: number;
  updatedAt: Date;
}

interface SaleRecord {
  id: number;
  dealerId: string;
  amount: number;
  commission: number;
  earnings: number;
  notes: string | null;
  week: number;
  year: number;
  timestamp: Date;
}

const prisma = new PrismaClient();

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

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { amount, notes } = data;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Get dealer's commission rate
    const dealers = await prisma.$queryRaw<DealerRecord[]>`
      SELECT * FROM dealers WHERE id = ${auth.userId}
    `;

    if (!dealers || dealers.length === 0) {
      // Create dealer if they don't exist
      const user = await clerkClient.users.getUser(auth.userId);
      await prisma.$executeRaw`
        INSERT INTO dealers (id, name, commission, createdAt, updatedAt)
        VALUES (${auth.userId}, ${user.firstName || 'Unknown'}, 0.20, datetime('now'), datetime('now'))
      `;
    }

    const commission = dealers && dealers.length > 0 ? dealers[0].commission : 0.20;
    const earnings = amount * commission;
    const { week, year } = getWeekNumber(new Date());

    // Record the sale
    const sale = await prisma.$executeRaw<SaleRecord>`
      INSERT INTO sales_records (dealerId, amount, commission, earnings, notes, week, year, timestamp)
      VALUES (${auth.userId}, ${amount}, ${commission}, ${earnings}, ${notes}, ${week}, ${year}, datetime('now'))
      RETURNING *
    `;

    // Update weekly performance
    const weeklyStats = await prisma.$queryRaw<WeeklyStats[]>`
      SELECT SUM(amount) as totalAmount, SUM(earnings) as totalEarnings
      FROM sales_records
      WHERE dealerId = ${auth.userId} AND week = ${week} AND year = ${year}
    `;

    if (weeklyStats && weeklyStats.length > 0) {
      const stats = weeklyStats[0];
      const id = `${auth.userId}-${week}-${year}`;
      const existingPerformance = await prisma.$queryRaw<WeeklyPerformance[]>`
        SELECT * FROM weekly_performance
        WHERE id = ${id}
      `;

      if (existingPerformance && existingPerformance.length > 0) {
        await prisma.$executeRaw`
          UPDATE weekly_performance
          SET totalSales = ${stats.totalAmount || 0},
              totalEarnings = ${stats.totalEarnings || 0},
              updatedAt = datetime('now')
          WHERE id = ${id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO weekly_performance (id, dealerId, week, year, totalSales, totalEarnings, rank, updatedAt)
          VALUES (${id}, ${auth.userId}, ${week}, ${year}, ${stats.totalAmount || 0}, ${stats.totalEarnings || 0}, 0, datetime('now'))
        `;
      }
    }

    return NextResponse.json({ sale });
  } catch (error) {
    console.error("Error recording sale:", error);
    return NextResponse.json(
      { error: "Failed to record sale" },
      { status: 500 }
    );
  }
}