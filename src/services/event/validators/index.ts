import { z } from "zod";

export const createEventSchema = z.object({
  event: z.string().min(3).max(255),
  start_date: z.date(),
  end_date: z.date(),
  profit_center_id: z.number().optional().nullable(),
});

export const createAttendanceSchema = z.object({
  event_id: z.string(),
  file: z.any(),
});
