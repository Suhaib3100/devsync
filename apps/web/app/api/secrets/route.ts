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
    const secretId = body.id; // Get the secret ID if it exists

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const contentEncryption = encrypt(content);
    const passwordEncryption = password ? encrypt(password) : null;

    if (secretId) {
      // Update existing secret
      const existingSecret = await prisma.secret.findUnique({
        where: { id: secretId },
      });

      if (!existingSecret) {
        return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
      }

      // Create history record
      await prisma.secretHistory.create({
        data: {
          content: existingSecret.content,
          iv: existingSecret.iv,
          secretId: existingSecret.id,
        },
      });

      // Update the secret
      const updatedSecret = await prisma.secret.update({
        where: { id: secretId },
        data: {
          content: contentEncryption.encryptedData,
          iv: contentEncryption.iv,
          password: passwordEncryption?.encryptedData,
          passwordIv: passwordEncryption?.iv,
          expiryTime: new Date(expiryTime),
        },
      });

      return NextResponse.json({ id: updatedSecret.id });
    } else {
      // Create new secret
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
    }
  } catch (error) {
    console.error('Create/Update secret error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create/update secret' }, { status: 500 });
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
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!secret) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 });
    }

    if (new Date() > new Date(secret.expiryTime)) {
      await prisma.secret.delete({ where: { id } });
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
      const decryptedHistory = secret.history.map(entry => ({
        content: decrypt(entry.content, entry.iv),
        createdAt: entry.createdAt,
      }));

      return NextResponse.json({
        content: decryptedContent,
        history: decryptedHistory,
      });
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return NextResponse.json({ error: 'Failed to decrypt secret' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}