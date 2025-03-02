import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// Ensure singleton instance of PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

const secretSchema = z.object({
  content: z.string(),
  password: z.string().optional().nullable(),
  expiryTime: z.string(),
});

// Ensure encryption key is set in environment variables
if (!process.env.ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY not set in environment variables. Using a random key (not recommended for production)');
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32).toString('hex');
const IV_LENGTH = 16;

function encrypt(text: string): { encryptedData: string; iv: string } {
  try {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

function decrypt(encryptedData: string, iv: string): string {
  try {
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, password, expiryTime } = secretSchema.parse(body);

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const contentEncryption = encrypt(content);
    const passwordEncryption = password ? encrypt(password) : null;

    const secret = await prisma.secret.create({
      data: {
        content: contentEncryption.encryptedData,
        iv: contentEncryption.iv,
        password: passwordEncryption?.encryptedData,
        passwordIv: passwordEncryption?.iv,
        expiryTime: new Date(expiryTime),
      },
    });

    return NextResponse.json({ id: secret.id });
  } catch (error) {
    console.error('Create secret error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create secret' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const password = searchParams.get('password');

    if (!id) {
      return NextResponse.json({ error: 'Secret ID is required' }, { status: 400 });
    }

    const secret = await prisma.secret.findUnique({
      where: { id },
    });

    if (!secret) {
      // Create a new secret vault with default values
      const defaultContent = 'Welcome to your new secret vault!';
      const defaultExpiryTime = new Date();
      defaultExpiryTime.setDate(defaultExpiryTime.getDate() + 7); // Set expiry to 7 days from now

      const contentEncryption = encrypt(defaultContent);
      const passwordEncryption = password ? encrypt(password) : null;

      const newSecret = await prisma.secret.create({
        data: {
          id, // Use the requested ID
          content: contentEncryption.encryptedData,
          iv: contentEncryption.iv,
          password: passwordEncryption?.encryptedData,
          passwordIv: passwordEncryption?.iv,
          expiryTime: defaultExpiryTime,
        },
      });

      return NextResponse.json({ content: defaultContent });
    }

    if (new Date() > new Date(secret.expiryTime)) {
      await prisma.secret.delete({ where: { id } }); // Clean up expired secret
      return NextResponse.json({ error: 'Secret has expired' }, { status: 410 });
    }

    try {
      if (secret.password && secret.passwordIv) {
        if (!password) {
          return NextResponse.json({ error: 'Password required for this secret' }, { status: 401 });
        }
        
        const decryptedPassword = decrypt(secret.password, secret.passwordIv);
        if (decryptedPassword !== password) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
      }

      const decryptedContent = decrypt(secret.content, secret.iv);
      return NextResponse.json({ content: decryptedContent });
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return NextResponse.json({ error: 'Failed to decrypt secret' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}