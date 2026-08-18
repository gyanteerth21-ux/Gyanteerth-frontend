import { z } from 'zod';

// Shared Validation Patterns
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Profile Schemas
export const profileSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal('')),
  user_number: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal('')),
  user_dob: z.string().optional().or(z.literal('')),
  user_gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
  user_pic: z.any().optional(),
});

// Admin CRUD Form Schemas
export const degreeSchema = z.object({
  name: z.string().min(2, "Degree name must be at least 2 characters"),
});

export const branchSchema = z.object({
  name: z.string().min(2, "Branch name must be at least 2 characters"),
});

export const collegeSchema = z.object({
  name: z.string().min(2, "College name must be at least 2 characters"),
});

export const tpoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  number: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal('')),
  collegeId: z.string().min(1, "College selection is required"),
});
