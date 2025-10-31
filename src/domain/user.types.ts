import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  image: z.string().url('Invalid image URL').optional(),
  isAnonymous: z.boolean().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  image: z.string().url('Invalid image URL').optional(),
  emailVerified: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export interface IUserDomain {
  id: string;
  email: string | null;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
