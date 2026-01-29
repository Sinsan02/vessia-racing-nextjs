import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { dbGet } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';

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

export const requireAuth = async (request: NextRequest) => {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

export const requireAdmin = async (request: NextRequest) => {
  const user = await requireAuth(request);
  
  // Sjekk aktuell rolle fra database
  const dbUser = await dbGet('SELECT role FROM users WHERE id = $1', [user.userId]);
  
  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return { ...user, role: dbUser.role };
};