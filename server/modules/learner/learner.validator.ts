import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, 'Enter your name using 2-60 letters.').max(60, 'Enter your name using 2-60 letters.').regex(/^[a-zA-Z\s]+$/, 'Enter your name using 2-60 letters.'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    let clean = val.replace(/\D/g, '');
    if (clean.length === 12 && clean.startsWith('91')) return clean.slice(2);
    return clean;
  }, z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number beginning with 6-9.')),
  age: z.string().min(1, 'Please select your age.'),
  profession: z.string().min(1, 'Please select your profession.'),
  marketingConsent: z.boolean().default(false),
  countryCode: z.string().default('+91'),
  timezone: z.string().default('Asia/Kolkata'),
  route: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  platform: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  utm_term: z.string().optional(),
  matchtype: z.string().optional(),
  network: z.string().optional(),
  device: z.string().optional(),
  keyword: z.string().optional(),
  placement: z.string().optional(),
  campaignid: z.string().optional(),
  adgroupid: z.string().optional(),
  workshopDate: z.string().optional(),
  workshopTime: z.string().optional(),
  whatsappLink: z.string().optional(),
});

export const LearnerDetailsQuerySchema = z.object({
  range: z.enum(['today', 'yesterday', '7days', '1month', 'custom']).default('today'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('10').transform(Number),
}).refine(data => {
  if (data.range === 'custom') {
    return !!data.startDate && !!data.endDate;
  }
  return true;
}, {
  message: "startDate and endDate are required when range is 'custom'",
  path: ['range'],
});

export const WorkshopCommunityLinkQuerySchema = z.object({
  route: z.string().optional()
});

export const WorkshopCommunityLinkSaveSchema = z.object({
  category: z.string(),
  route: z.string(),
  whatsappLink: z.string().url('Must be a valid URL'),
  workshopDate: z.string(),
  workshopTime: z.string(),
});
