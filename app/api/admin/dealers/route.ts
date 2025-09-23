import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';

// import type { Dealer } from "@prisma/client";



export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = user.publicMetadata.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all dealers with their commission rates
    const dealers = await prisma.dealer.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Get user data for each dealer
    const dealerUsers = await Promise.all(
      dealers.map((dealer: { id: string }) => clerkClient.users.getUser(dealer.id))
    );

    // Combine dealer data with user data
    const dealersWithDetails = dealers.map((dealer: { id: string; [key: string]: any }) => {
      const userData = dealerUsers.find(u => u.id === dealer.id);
      return {
        ...dealer,
        name: userData?.firstName || 'Unknown',
        email: userData?.emailAddresses[0]?.emailAddress || ''
      };
    });

    return NextResponse.json(dealersWithDetails);
  } catch (error) {
    console.error("Error fetching dealers:", error);
    return NextResponse.json(
      { error: "Failed to fetch dealers" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await clerkClient.users.getUser(auth.userId);
    const isAdmin = user.publicMetadata.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { dealerId, commission } = await request.json();

    if (!dealerId || typeof commission !== 'number' || commission < 0 || commission > 1) {
      return NextResponse.json(
        { error: "Invalid commission rate" },
        { status: 400 }
      );
    }

    // Update dealer's commission rate
    const dealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: { commission }
    });

    return NextResponse.json(dealer);
  } catch (error) {
    console.error("Error updating commission:", error);
    return NextResponse.json(
      { error: "Failed to update commission" },
      { status: 500 }
    );
  }
}