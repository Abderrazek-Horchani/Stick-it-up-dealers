import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

interface PrismaError extends Error {
  code: string;
  meta?: Record<string, any>;
  clientVersion?: string;
}

// Define RequestStatus enum manually to match your Prisma schema
enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Update request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PATCH request received with params:', params);
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      console.error('Invalid ID format:', params.id);
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    // Log available status values
    console.log('Available status values:', Object.values(RequestStatus));
    
    if (!body.status) {
      console.error('Status is missing in request body');
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatus = Object.values(RequestStatus).includes(body.status);
    console.log('Status validation:', { 
      receivedStatus: body.status,
      isValid: validStatus,
      availableStatuses: Object.values(RequestStatus)
    });
    
    if (!validStatus) {
      console.error('Invalid status value:', body.status);
      return NextResponse.json(
        { error: `Invalid status value. Must be one of: ${Object.values(RequestStatus).join(', ')}` },
        { status: 400 }
      );
    }

    // Check if the request exists
    console.log('Checking if request exists:', id);
    const existingRequest = await prisma.restockRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      console.error('Request not found:', id);
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    console.log('Existing request found:', existingRequest);
    console.log('Attempting to update status from', existingRequest.status, 'to', body.status);

    const updatedRequest = await prisma.restockRequest.update({
      where: { id },
      data: { status: body.status },
      include: { stickers: true },
    });

    return NextResponse.json(updatedRequest);
  } catch (err) {
    console.error('Error updating request:', {
      requestId: params.id,
      error: err
    });

    if (err instanceof Error) {
      // Check if it's a Prisma error by looking at the constructor name
      if (err.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as PrismaError;
        console.error('Prisma error details:', {
          code: prismaError.code,
          meta: prismaError.meta,
          clientVersion: prismaError.clientVersion
        });
        
        switch (prismaError.code) {
          case 'P2002':
            return NextResponse.json(
              { error: 'Unique constraint violation' },
              { status: 409 }
            );
          case 'P2025':
            return NextResponse.json(
              { error: 'Record not found' },
              { status: 404 }
            );
          default:
            return NextResponse.json(
              { error: `Database error: ${prismaError.code}` },
              { status: 500 }
            );
        }
      }

      return NextResponse.json(
        { error: 'Internal server error', message: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Unknown error' },
      { status: 500 }
    );
  }
}

// Delete request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // First delete all associated sticker requests
    await prisma.stickerRequest.deleteMany({
      where: { requestId: id },
    });

    // Then delete the restock request
    await prisma.restockRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting restock request:', error);
    return NextResponse.json(
      { error: 'Error deleting restock request' },
      { status: 500 }
    );
  }
}