import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ✅ GET one restock request by ID (with stickers)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const request = await prisma.restockRequest.findUnique({
      where: { id: Number(params.id) },
      include: { stickers: true }, // load StickerRequest[]
    });

    if (!request) {
      return NextResponse.json(
        { error: "Restock request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch restock request" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE status of a restock request
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    const updated = await prisma.restockRequest.update({
      where: { id: Number(params.id) },
      data: { status }, // must be one of: PENDING | PRINTING | PRINTED | DELIVERED
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update restock request" },
      { status: 500 }
    );
  }
}

// ✅ DELETE a restock request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.restockRequest.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete restock request" },
      { status: 500 }
    );
  }
}
