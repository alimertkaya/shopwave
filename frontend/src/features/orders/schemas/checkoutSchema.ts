import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName:   z.string().min(3, 'Full name must be at least 3 characters'),
  phone:      z.string().regex(/^[0-9]{10,11}$/, 'Please enter a valid phone number'),
  address:    z.string().min(10, 'Address must be at least 10 characters'),
  city:       z.string().min(2, 'City must be at least 2 characters'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Please enter a 5-digit postal code'),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
