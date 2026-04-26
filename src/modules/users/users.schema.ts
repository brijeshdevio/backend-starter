import { z } from "zod";

export const findUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().min(1).optional(),
    role: z.enum(["user", "admin"]).optional(),
  })
  .strict();

export type FindUsersQueryDto = z.infer<typeof findUsersQuerySchema>;
