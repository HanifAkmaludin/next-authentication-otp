import { POST } from '@/app/api/auth/signup/route';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import bcrypt from 'bcrypt';

// Mock modules
jest.mock('../../app/generated/prisma', () => {
  const mockPrisma = {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('bcrypt');
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => data),
  },
}));

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

describe('POST /api/auth/signup', () => {
  const mockUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  let prisma: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Initialize fresh mock Prisma instance
    prisma = new PrismaClient();
  });

  it('should register a new user successfully', async () => {
    // Setup mock implementations
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.create.mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

    // Create mock request
    const req = {
      json: jest.fn().mockResolvedValue(mockUser),
    } as any;

    // Call the API
    await POST(req);

    // Assertions
    expect(req.json).toHaveBeenCalled();
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 10);
    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        email: mockUser.email,
        password: 'hashedPassword',
        name: mockUser.name,
      },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.BASE_URL}/api/auth/send-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mockUser.email }),
      }
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ user: mockUser });
  });

  it('should return error if user already exists', async () => {
    // Setup mock implementation
    prisma.users.findUnique.mockResolvedValue(mockUser);

    // Create mock request
    const req = {
      json: jest.fn().mockResolvedValue(mockUser),
    } as any;

    // Call the API
    const response = await POST(req);

    // Assertions
    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email },
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'User already exists' },
      { status: 400 }
    );
    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'short',
      name: '',
    };

    const req = {
      json: jest.fn().mockResolvedValue(invalidUser),
    } as any;

    await expect(POST(req)).rejects.toThrow();
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });
});