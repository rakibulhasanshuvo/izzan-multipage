import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiHandler } from './api';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/client';

// Mock NextRequest and NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => ({ body, init })),
    },
    NextRequest: vi.fn(),
  };
});

describe('apiHandler', () => {
  const mockReq = {} as NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the successful handler response', async () => {
    const successResponse = { body: { ok: true }, init: { status: 200 } };
    const handler = vi.fn().mockResolvedValue(successResponse);
    const wrappedHandler = apiHandler(handler);

    const result = await wrappedHandler(mockReq);

    expect(handler).toHaveBeenCalledWith(mockReq);
    expect(result).toEqual(successResponse);
  });

  it('should return 404 for Prisma known request error with code P2025', async () => {
    const p2025Error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '7.8.0',
    });
    const handler = vi.fn().mockRejectedValue(p2025Error);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Record not found' },
      { status: 404 }
    );
  });

  it('should return 400 for other Prisma known request errors', async () => {
    const otherPrismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
    const handler = vi.fn().mockRejectedValue(otherPrismaError);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Bad Request: Unique constraint failed' },
      { status: 400 }
    );
  });

  it('should return 400 if error has a code property but is not PrismaClientKnownRequestError', async () => {
    const customError = new Error('Custom code error') as Error & { code: string };
    customError.code = 'SOME_CUSTOM_CODE';
    const handler = vi.fn().mockRejectedValue(customError);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Bad Request: Custom code error' },
      { status: 400 }
    );
  });

  it('should return 503 for Prisma initialization error', async () => {
    const initError = new Prisma.PrismaClientInitializationError('Init failed', '7.8.0');
    const handler = vi.fn().mockRejectedValue(initError);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Service Unavailable: Database connection error' },
      { status: 503 }
    );
  });

  it('should return 503 for Prisma rust panic error', async () => {
    const panicError = new Prisma.PrismaClientRustPanicError('Panic!', '7.8.0');
    const handler = vi.fn().mockRejectedValue(panicError);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Service Unavailable: Database connection error' },
      { status: 503 }
    );
  });

  it('should return 503 for errors with connection in the message', async () => {
    const connectionError = new Error('Failed to establish a connection to the database');
    const handler = vi.fn().mockRejectedValue(connectionError);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Service Unavailable: Database connection error' },
      { status: 503 }
    );
  });

  it('should return 500 with default error message for unknown errors', async () => {
    const unknownError = new Error('Something went terribly wrong');
    const handler = vi.fn().mockRejectedValue(unknownError);
    const wrappedHandler = apiHandler(handler);

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  });

  it('should return 500 with custom default error message', async () => {
    const unknownError = new Error('Something went terribly wrong');
    const handler = vi.fn().mockRejectedValue(unknownError);
    const wrappedHandler = apiHandler(handler, 'Custom Server Error Message');

    await wrappedHandler(mockReq);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Custom Server Error Message' },
      { status: 500 }
    );
  });
});
