import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await clerkClient.users.getUser(userId);
    if (currentUser.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all users from Clerk
    const users = await clerkClient.users.getUserList();
    
    // Filter dealers
    const dealers = users.filter(user => user.publicMetadata?.role === "dealer");

    // Create or update dealer records
    const results = await Promise.all(
      dealers.map(async (dealer) => {
        const fullName = [dealer.firstName, dealer.lastName]
          .filter(Boolean)
          .join(" ") || dealer.id;

        return prisma.dealer.upsert({
          where: { id: dealer.id },
          create: {
            id: dealer.id,
            name: fullName,
            commission: 0.20, // Default 20% commission
          },
          update: {
            name: fullName,
          },
        });
      })
    );

    return NextResponse.json({
      message: `Synchronized ${results.length} dealers`,
      dealers: results,
    }, { status: 200 });
  } catch (error) {
    console.error("Error syncing dealers:", error);
    return NextResponse.json(
      { error: "Failed to sync dealers" },
      { status: 500 }
    );
  }
}