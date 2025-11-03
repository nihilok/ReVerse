import { PermissionRepository } from '@/infrastructure/repositories/permission.repository';
import { Permission } from '@/infrastructure/database/schema/permissions';

/**
 * CheckPermissionUseCase (Functional Core)
 * 
 * Business logic for checking if a user has a specific permission.
 * This use case enforces the business rule: "A user has a permission if they 
 * are assigned to at least one role that has that permission."
 */
export class CheckPermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  /**
   * Check if a user has a specific permission by resource and action
   * 
   * @param userId - The user ID to check permissions for
   * @param resource - The resource name (e.g., "users", "reports")
   * @param action - The action name (e.g., "read", "write", "delete")
   * @returns true if user has the permission, false otherwise
   */
  async execute(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    // Get all permissions for the user
    const userPermissions = await this.permissionRepository.getUserPermissions(userId);

    // Check if any permission matches the requested resource and action
    return userPermissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );
  }

  /**
   * Get all permissions for a user
   * 
   * @param userId - The user ID to get permissions for
   * @returns Array of all permissions the user has
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    return await this.permissionRepository.getUserPermissions(userId);
  }

  /**
   * Check multiple permissions at once
   * Useful for checking if a user has any of several permissions
   * 
   * @param userId - The user ID to check permissions for
   * @param checks - Array of {resource, action} pairs to check
   * @returns Object mapping each check to its result
   */
  async checkMultiple(
    userId: string,
    checks: Array<{ resource: string; action: string }>
  ): Promise<Record<string, boolean>> {
    const userPermissions = await this.permissionRepository.getUserPermissions(userId);

    // Preprocess permissions into a Set for O(1) lookups
    const permissionSet = new Set(
      userPermissions.map(p => `${p.resource}:${p.action}`)
    );

    const results: Record<string, boolean> = {};

    for (const check of checks) {
      const key = `${check.resource}:${check.action}`;
      results[key] = permissionSet.has(key);
    }

    return results;
  }
}
