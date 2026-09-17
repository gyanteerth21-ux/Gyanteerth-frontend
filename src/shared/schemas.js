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

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  number: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  dob: z.string().min(1, "Birth date is required"),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: "Please select your gender" }) }),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  college: z.string().optional().or(z.literal('')),
  branch: z.string().optional().or(z.literal('')),
  degree: z.string().optional().or(z.literal('')),
  year: z.string().optional().or(z.literal('')),
  expertise: z.string().optional().or(z.literal('')),
  pic: z.any().optional(),
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

// Course Content Schemas
export const categorySchema = z.object({
  category_name: z.string().min(2, "Category name must be at least 2 characters"),
  category_description: z.string().optional(),
});

export const courseSchema = z.object({
  course_title: z.string().min(2, "Course title is required"),
  instructor_id: z.string().min(1, "Instructor is required"),
  category_id: z.string().min(1, "Category is required"),
  course_Type: z.enum(['recorded', 'live']),
  course_description: z.string().min(10, "Please provide a detailed description"),
  benefits: z.string().optional(),
  required_knowledge: z.string().optional(),
  original_pay: z.coerce.number().optional().or(z.literal('')),
  discount_pay: z.coerce.number().optional().or(z.literal('')),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']),
  duration: z.string().min(1, "Duration is required"),
  language: z.string().min(2, "Language is required"),
  thumbnail: z.any().optional(),
});

export const demoSchema = z.object({
  title: z.string().min(2, "Demo title is required"),
  video_url: z.string().url("Must be a valid URL").or(z.literal('')),
  duration: z.string().optional(),
});

export const moduleSchema = z.object({
  Title: z.string().min(2, "Module title is required"),
  Course_Description: z.string().min(5, "Overview is required"),
  Position: z.coerce.number().min(1).optional(),
});

export const lessonSchema = z.object({
  course_description: z.string().min(2, "Lesson name is required"),
  video_url: z.string().url("Must be a valid URL").or(z.literal('')),
});

export const liveSessionSchema = z.object({
  Title: z.string().min(2, "Session topic is required").optional().or(z.literal('')),
  Meeting_URL: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  Provider: z.string().min(1, "Provider is required"),
  Start_time: z.string().min(1, "Start time is required"),
  End_time: z.string().min(1, "End time is required"),
  Status: z.enum(['scheduled', 'live', 'completed']),
});

export const recSessionSchema = z.object({
  Rec_Video_URL: z.string().url("Must be a valid URL").or(z.literal('')),
  Duration: z.string().min(1, "Duration is required"),
});

export const notesSchema = z.object({
  Title: z.string().min(2, "Resource label is required"),
  Note_URL: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  File_URL: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  File_Type: z.string().optional()
});

export const assessmentSchema = z.object({
  Title: z.string().min(2, "Assessment title is required"),
  Description: z.string().optional(),
  Total_Mark: z.coerce.number().min(1, "Must be at least 1"),
  Passing_Mark: z.coerce.number().min(1, "Must be at least 1"),
  Duration: z.coerce.number().min(1, "Must be at least 1 minute"),
  Attempt_Limit: z.coerce.number().min(1, "Must allow at least 1 attempt"),
  Status: z.string().optional()
});

export const questionSchema = z.object({
  Question_Txt: z.string().min(5, "Question text must be at least 5 characters"),
  Question_Type: z.enum(['MCQ', 'True/False']),
  Mark: z.coerce.number().min(1, "Point value must be at least 1"),
  Explanation: z.string().optional()
});
