import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface User {
  id: string;
  username: string;
  email?: string | null;
  role: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: User;
  organization: Organization;
  token: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function createUser(
  username: string,
  password: string,
  email?: string
): Promise<AuthResult> {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || undefined }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec ce nom d\'utilisateur ou cette adresse email existe déjà');
    }

    const passwordHash = await hashPassword(password);
    
    // Créer d'abord l'organisation
    const organization = await prisma.organization.create({
      data: {
        name: `Organisation de ${username}`,
      },
    });

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'admin',
        organizationId: organization.id,
      },
    });

    // Générer le token
    const token = generateToken(user.id);

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'user_created',
        resource: 'user',
        resourceId: user.id,
        userId: user.id,
        organizationId: organization.id,
        metadata: JSON.stringify({ username, email }),
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      token,
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw new Error(error instanceof Error ? error.message : 'Impossible de créer l\'utilisateur');
  }
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthResult | null> {
  try {
    // Chercher l'utilisateur avec son organisation
    const user = await prisma.user.findUnique({
      where: { username },
      include: { organization: true },
    });

    if (!user) {
      return null;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Générer le token
    const token = generateToken(user.id);

    // Log de l'audit
    await prisma.auditLog.create({
      data: {
        action: 'user_login',
        resource: 'user',
        resourceId: user.id,
        userId: user.id,
        organizationId: user.organizationId,
        metadata: JSON.stringify({ username }),
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        createdAt: user.organization.createdAt,
        updatedAt: user.organization.updatedAt,
      },
      token,
    };
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    throw new Error('Erreur d\'authentification');
  }
}

export async function getUserFromToken(token: string): Promise<{ user: User; organization: Organization } | null> {
  try {
    const userId = await verifyToken(token);
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        createdAt: user.organization.createdAt,
        updatedAt: user.organization.updatedAt,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

// Helper function for API route authentication
export async function auth(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token d\'authentification requis'
      };
    }

    const token = authHeader.substring(7);
    const authResult = await getUserFromToken(token);
    
    if (!authResult) {
      return {
        success: false,
        error: 'Token invalide ou expiré'
      };
    }

    return {
      success: true,
      user: authResult.user,
      organization: authResult.organization
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return {
      success: false,
      error: 'Erreur de vérification du token'
    };
  }
}
