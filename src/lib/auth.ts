import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: string;
  organizationId: string;
  role: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    return {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role || 'user'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Alias pour la compatibilité
export const verifyJWT = verifyAuth;

export function generateToken(user: AuthUser): string {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  
  return jwt.sign(
    {
      userId: user.userId,
      organizationId: user.organizationId,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
}
