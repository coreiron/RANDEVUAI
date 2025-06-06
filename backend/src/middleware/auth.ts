
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { createResponse } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    emailVerified: boolean;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        createResponse(false, null, '', 'Authorization token required')
      );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json(
      createResponse(false, null, '', 'Invalid or expired token')
    );
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        emailVerified: decodedToken.email_verified || false
      };
    }
    
    next();
  } catch (error) {
    // Optinal auth, so continue even if token is invalid
    next();
  }
};
