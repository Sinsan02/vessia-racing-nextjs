import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';

// Ensure JWT_SECRET is available in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export interface User {
  id: number;
  name: string;
  email: string;
  gamertag: string;
  experience: string;
  role: string;
  is_driver: boolean;
  created_at: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const getUserFromRequest = (request: NextRequest): JWTPayload | null => {
  const token = request.cookies.get('authToken')?.value;
  if (!token) return null;
  return verifyToken(token);
};

export const requireAuth = (request: NextRequest) => {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

export const requireAdmin = async (request: NextRequest) => {
  try {
    const user = requireAuth(request);
    
    // Check current role from Supabase database
    const { data: dbUser, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.userId)
      .single();
    
    if (error || !dbUser || dbUser.role !== 'admin') {
      return { success: false, error: 'Admin access required', status: 403 };
    }
    
    return { success: true, user: { ...user, role: dbUser.role } };
  } catch (error) {
    return { success: false, error: 'Authentication required', status: 401 };
  }
};