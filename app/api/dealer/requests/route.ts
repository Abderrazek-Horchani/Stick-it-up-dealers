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

    // Get user data to verify identity
    const user = await clerkClient.users.getUser(auth.userId);
    
    // Fetch requests for this dealer
    const requests = await prisma.restockRequest.findMany({
      where: {
        dealerName: auth.userId
      },
      include: {
        stickers: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Get the dealer's name
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';

    // Transform requests format to match admin format
    const transformedRequests = requests.map((request: { stickers: any[]; [key: string]: any }) => ({
      ...request,
      displayName: userName, // Add display name
      stickers: request.stickers.map((sticker: { category: string; name: string; [key: string]: any }) => ({
        ...sticker,
        category: sticker.category,
        name: sticker.name
      }))
    }));

    return NextResponse.json({ requests: transformedRequests });
  } catch (error) {
    console.error("Error fetching restock requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch restock requests" },
      { status: 500 }
    );
  }
}