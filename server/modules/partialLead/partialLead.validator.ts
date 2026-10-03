import { z } from 'zod';

export const PartialLeadSaveSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  route: z.string().optional(),
}).refine(data => data.email || data.phoneNumber, {
  message: 'Email or phone number is required.',
  path: ['email']
}).transform(data => {
  return {
    ...data,
    email: data.email || undefined
  };
});

export const PartialLeadQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['PENDING', 'CONVERTED', 'ABANDONED']).optional()
});
