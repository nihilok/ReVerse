import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { CreateUserInput, CreateUserSchema } from '@/domain/user.types';
import { User } from '@/infrastructure/database/schema/users';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    // Validate input
    const validatedData = CreateUserSchema.parse(input);

    // Check if user already exists (only if email is provided)
    if (validatedData.email) {
      const existingUser = await this.userRepository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    // Create user
    const user = await this.userRepository.createUser({
      email: validatedData.email || null,
      name: validatedData.name || null,
      image: validatedData.image || null,
      isAnonymous: validatedData.isAnonymous || false,
    });

    return user;
  }
}
