import { z } from 'zod';

export const HealthSchema = z.object({
  ok: z.literal(true),
  service: z.literal('founderos'),
  time: z.string().datetime(),
});
