import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// TS enum matching your Prisma schema
enum RequestStatus {
  PENDING = 'PENDING',
  PRINTING = 'PRINTING',
  PRINTED = 'PRINTED',
  DELIVERED = 'DELIVERED'
}

interface PrismaError extends Error {
  code: string;
  meta?: Record<string, any>;
  clientVersion?: string;
}

// -------------------- GET: Fetch Restock Request --------------------
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });

    const restockRequest = await prisma.restockRequest.findUnique({
      where: { id },
      include: { stickers: true },
    });

    if (!restockRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    return NextResponse.json(restockRequest);
  } catch (err) {
    console.error('Error fetching restock request:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// -------------------- PATCH: Update Request Status --------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });

    const body = await request.json();
    if (!body.status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    if (!Object.values(RequestStatus).includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status value. Must be one of: ${Object.values(RequestStatus).join(', ')}` },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.restockRequest.findUnique({ where: { id } });
    if (!existingRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    const updatedRequest = await prisma.restockRequest.update({
      where: { id },
      data: { status: body.status },
      include: { stickers: true },
    });

    return NextResponse.json(updatedRequest);
  } catch (err) {
    console.error('Error updating request:', err);

    if (err instanceof Error && (err as PrismaError).code) {
      const prismaError = err as PrismaError;
      switch (prismaError.code) {
        case 'P2002':
          return NextResponse.json({ error: 'Unique constraint violation' }, { status: 409 });
        case 'P2025':
          return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        default:
          return NextResponse.json({ error: `Database error: ${prismaError.code}` }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Internal server error', message: (err as Error).message }, { status: 500 });
  }
}

// -------------------- DELETE: Delete Restock Request --------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });

    // Delete all associated sticker requests first (cascade should handle, but explicit delete is safe)
    await prisma.stickerRequest.deleteMany({ where: { requestId: id } });
    await prisma.restockRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting restock request:', err);
    return NextResponse.json({ error: 'Error deleting restock request' }, { status: 500 });
  }
}
