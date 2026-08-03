import { z } from "zod";
import { PREDEFINED_CATEGORIES } from "./constants.js";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ServiceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(300),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  category: z.enum(PREDEFINED_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid predefined category" }),
  }),
  image: z.string().url("Main image must be a valid URL"),
  gallery: z.array(z.string().url()).optional(),
  deliveryTime: z.number().min(1, "Delivery time must be at least 1 day"),
  revisions: z.number().min(0, "Revisions cannot be negative"),
  features: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const RequestCreateSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  customerMessage: z.string().optional(),
});

export const RequestUpdateSchema = z.object({
  status: z.enum(["Pending", "Accepted", "In Progress", "Completed", "Cancelled"]).optional(),
  paymentStatus: z.enum(["Pending", "Paid", "Refunded", "Failed"]).optional(),
  adminNotes: z.string().optional(),
  note: z.string().optional(),
});
