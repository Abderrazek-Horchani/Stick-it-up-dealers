import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RestockRequestBody, StickerRequest } from "@/app/types/restock";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get current user
    const currentUser = await clerkClient.users.getUser(auth.userId);
    const userRole = currentUser.publicMetadata?.role;

    // Get restock requests
    const requests = await prisma.restockRequest.findMany({
      include: {
        stickers: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Get all unique dealer IDs from requests
    const dealerIds = [...new Set(requests.map((req: { dealerName: string }) => req.dealerName))];

    // Fetch all dealers' information in one batch
    const usersData = await clerkClient.users.getUserList({
      userId: dealerIds as string[]
    });

    // Create a map of dealer IDs to names
    const dealerNames = new Map(
      usersData.map(user => [
        user.id,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'
      ])
    );

    // Add display names to requests
    const requestsWithNames = requests.map((request: typeof requests[number]) => ({
      ...request,
      displayName: dealerNames.get(request.dealerName) || request.dealerName
    }));

    return NextResponse.json(requestsWithNames);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data to verify identity
    const user = await clerkClient.users.getUser(auth.userId);

    // Parse request body
    const body = await request.json() as RestockRequestBody;
    console.log('Raw request body:', body);

    // Extract stickers from either items or stickers field
    const stickers = body.items || body.stickers;

    // Validate request data
    if (!stickers || !Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get dealer information from the database
    const dealer = await prisma.dealer.findUnique({
      where: {
        id: auth.userId,
      },
    });

    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer not found" },
        { status: 404 }
      );
    }

    const restockRequest = await prisma.restockRequest.create({
      data: {
        dealerName: auth.userId,
        timestamp: new Date(),
        status: "PENDING",
        stickers: {
          create: stickers.map((sticker: StickerRequest) => ({
            name: sticker.name,
            category: sticker.category,
            quantity: sticker.quantity,
          })),
        },
      },
      include: {
        stickers: true,
      },
    });

    return NextResponse.json(restockRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating restock request:", error);
    return NextResponse.json(
      { error: "Failed to create restock request" },
      { status: 500 }
    );
  }
}