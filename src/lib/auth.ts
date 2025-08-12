// Client-side auth functions only
export {
  checkAuthClient,
  logoutClient
} from './auth-client';

// Server functions must be imported directly from their respective files:
// For API routes: import { generateToken, verifyToken, etc. } from '@/lib/auth-server' 