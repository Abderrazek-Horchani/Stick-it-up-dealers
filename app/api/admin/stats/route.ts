import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you'll need to implement your admin check)
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = user.publicMetadata.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const timeframe = request.nextUrl.searchParams.get('timeframe') || 'all';
    let dateFilter = {};

    const now = new Date();
    switch (timeframe) {
      case 'week':
        dateFilter = {
          timestamp: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          }
        };
        break;
      case 'month':
        dateFilter = {
          timestamp: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          }
        };
        break;
      case 'year':
        dateFilter = {
          timestamp: {
            gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          }
        };
        break;
      // 'all' doesn't need a date filter
    }

    // Get overall stats
    const salesStats = await prisma.salesRecord.aggregate({
      _sum: {
        amount: true,
        earnings: true,
      },
      where: dateFilter,
    });

    // Get dealer-specific stats
    const dealerStats = await prisma.salesRecord.groupBy({
      by: ['dealerId'],
      _sum: {
        amount: true,
        earnings: true,
      },
      where: dateFilter,
    });

    // Get dealer details and commission rates
    const dealers = await prisma.dealer.findMany();
    const dealerUsers = await Promise.all(
      dealers.map((dealer: { id: string; commission: number }) => clerkClient.users.getUser(dealer.id))
    );

    interface DealerStats {
      dealerId: string;
      _sum: {
        amount: number | null;
        earnings: number | null;
      };
    }

    // Calculate stats per dealer
    const dealerStatsList = dealers.map((dealer: { id: string; commission: number }) => {
      const stats: DealerStats | undefined = dealerStats.find((stat: DealerStats) => stat.dealerId === dealer.id);
      const user = dealerUsers.find((u: { id: string }) => u.id === dealer.id);
      return {
        dealerId: dealer.id,
        dealerName: user?.firstName || 'Unknown',
        totalSales: stats?._sum.amount || 0,
        totalEarnings: stats?._sum.earnings || 0,
        commission: dealer.commission,
      };
    });

    return NextResponse.json({
      totalSales: salesStats._sum.amount || 0,
      totalProfit: (salesStats._sum.amount || 0) - (salesStats._sum.earnings || 0),
      totalDealers: dealers.length,
      dealerStats: dealerStatsList,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}