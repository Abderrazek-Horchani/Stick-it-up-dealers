import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

// ✅ PATCH: Update request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatus = Object.values(RequestStatus).includes(body.status);
    if (!validStatus) {
      return NextResponse.json(
        {
          error: `Invalid status value. Must be one of: ${Object.values(
            RequestStatus
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if request exists
    const existingRequest = await prisma.restockRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updatedRequest = await prisma.restockRequest.update({
      where: { id },
      data: { status: body.status },
      include: { stickers: true },
    });

    return NextResponse.json(updatedRequest);
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002":
          return NextResponse.json(
            { error: "Unique constraint violation" },
            { status: 409 }
          );
        case "P2025":
          return NextResponse.json(
            { error: "Record not found" },
            { status: 404 }
          );
        default:
          return NextResponse.json(
            { error: `Database error: ${err.code}` },
            { status: 500 }
          );
      }
    }

    if (err instanceof Error) {
      return NextResponse.json(
        { error: "Internal server error", message: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: "Unknown error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Remove request and associated stickers
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Delete associated sticker requests first
    await prisma.stickerRequest.deleteMany({
      where: { requestId: id },
    });

    // Then delete the restock request
    await prisma.restockRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      }
    }

    if (err instanceof Error) {
      return NextResponse.json(
        { error: "Internal server error", message: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error deleting restock request" },
      { status: 500 }
    );
  }
}
