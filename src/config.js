// Centralized API Configuration for Gyanteerth LMS
const LOCAL_API_BASE = "http://localhost:8000/gyantreeth/v1";
const PRODUCTION_API_BASE = "https://api.gyanteerthlearning.online/gyantreeth/v1";

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? LOCAL_API_BASE : PRODUCTION_API_BASE);

// Detailed Service Endpoints
export const ADMIN_API = `${API_BASE}/admin`;
export const AUTH_API = `${API_BASE}/auth_checkpoint`;
export const USER_API = `${API_BASE}/user`;
export const STUDENT_API = `${API_BASE}/student`;
export const TRAINER_API = `${API_BASE}/trainer`;

// Helper to provide standard headers
export const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// Helper to format image URLs (e.g. converting Google Drive viewer links to direct image links)
export const optimizeImageUrl = (url) => {
  if (!url)
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      // Google recently started blocking drive.google.com/uc hotlinks with 403s.
      // Using lh3.googleusercontent.com is a known workaround for public drive images.
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
};
