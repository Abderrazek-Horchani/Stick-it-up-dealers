import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await clerkClient.users.getUser(auth.userId);
    if (currentUser.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all requests
    const requests = await prisma.restockRequest.findMany({
      include: {
        stickers: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Get all unique dealer IDs
    const dealerIds = [...new Set(requests.map(req => req.dealerName))];

    // Fetch all dealers' information in one batch
    const usersData = await clerkClient.users.getUserList({
      userId: dealerIds
    });

    // Create a map of dealer IDs to names
    const dealerNames = new Map(
      usersData.map(user => [
        user.id,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'
      ])
    );

    // Add display names to requests
    const requestsWithNames = requests.map(request => ({
      ...request,
      displayName: dealerNames.get(request.dealerName) || request.dealerName
    }));

    return NextResponse.json(requestsWithNames);
  } catch (error) {
    console.error('Error fetching restock requests:', error);
    return NextResponse.json(
      { error: 'Error fetching restock requests' },
      { status: 500 }
    );
  }
}