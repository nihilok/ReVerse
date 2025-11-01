// Export auth types for use across the application
// The anonymous plugin extends the User type with isAnonymous field
import type { User } from 'better-auth';

// Our auth user includes the isAnonymous field from the anonymous plugin
export type AuthUser = User & {
  isAnonymous: boolean;
};
