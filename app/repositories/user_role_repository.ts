import UserRole from '#models/user_role'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class UserRoleRepository {
  /**
   * Creates a new user role
   */
  async create(
    data: { userId: number; role: 'client' | 'professional' | 'admin' },
    trx?: TransactionClientContract
  ): Promise<UserRole> {
    return await UserRole.create(data, { client: trx })
  }

  /**
   * Finds roles by user ID
   */
  async findByUserId(userId: number): Promise<UserRole[]> {
    return await UserRole.query().where('user_id', userId)
  }

  /**
   * Checks if user has a specific role
   */
  async hasRole(userId: number, role: 'client' | 'professional' | 'admin'): Promise<boolean> {
    const userRole = await UserRole.query()
      .where('user_id', userId)
      .where('role', role)
      .first()

    return !!userRole
  }
}

