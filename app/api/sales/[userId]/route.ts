import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';


const prisma = new PrismaClient();

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = getAuth(request);
    if (!auth.userId || auth.userId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sales = await prisma.salesRecord.findMany({
      where: {
        dealerId: params.userId
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Limit to last 50 sales
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}