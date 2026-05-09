// Centralized API Configuration for Gyanteerth LMS
<<<<<<< HEAD
export const API_BASE = 'https://lms-vert-alpha.vercel.app/gyantreeth/v1';
=======
export const API_BASE = 'https://api.gyanteerthlearning.online/gyantreeth/v1';
>>>>>>> origin/main

// Detailed Service Endpoints
export const ADMIN_API = `${API_BASE}/admin`;
export const AUTH_API = `${API_BASE}/auth_checkpoint`;
export const USER_API = `${API_BASE}/user`;
export const STUDENT_API = `${API_BASE}/student`;
export const TRAINER_API = `${API_BASE}/trainer`;

// Helper to provide standard headers
export const getHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
});
