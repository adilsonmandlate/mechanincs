import User from '#models/user'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

export class UserRepository {
  /**
   * Finds all users from the database.
   * @returns Users list.
   */
  async find({
    page,
    limit,
    role,
    gender,
    search,
  }: {
    page: number
    limit: number
    role?: string
    gender?: string
    search?: string
  }): Promise<User[]> {
    const query = User.query()

    if (search) {
      query.where((builder) => {
        builder
          .orWhere('normalizedName', 'ILIKE', `%${search}%`)
          .orWhere('msisdn', 'ILIKE', `%${search}%`)
          .orWhere('email', 'ILIKE', `%${search}%`)
      })
    }

    if (gender) {
      query.where('gender', gender)
    }

    if (role) {
      query.where('role', role)
    }

    query.orderBy('created_at', 'desc')

    return await query.paginate(page, limit)
  }

  /**
   * Finds a user by their email.
   * @param email - The email to search for.
   * @returns The user object or null if not found.
   */
  async findByEmail(email: string) {
    return await User.query().where('email', email).select('id').first()
  }

  /**
   * Finds a user by their phone number.
   * @param msisdn - The phone number to search for.
   * @returns The user object or null if not found.
   */
  async findByMsisdn(msisdn: string) {
    return await User.query().where('msisdn', msisdn).select('id').first()
  }

  /**
   * Finds a user by their ID.
   * @param id - The ID of the user to search for.
   * @returns The user object or null if not found.
   */
  async findById(id: number, organizationId: number): Promise<User | null> {
    return await User.query().where('id', id).andWhere('organization_id', organizationId).first()
  }

  /**
   * Creates a new user in the database.
   * @param data - The user data to insert.
   */
  async create(data: Partial<User>, trx?: TransactionClientContract): Promise<User> {
    return await User.create(data, { client: trx })
  }

  /**
   * Updates an existing user in the database.
   * @param id - The ID of the user to update.
   * @param data - The data to update the user with.
   */
  async update(
    id: number,
    organizationId: number,
    data: Partial<User>,
    trx?: TransactionClientContract
  ): Promise<User | null> {
    const user = await User.query()
      .where('id', id)
      .andWhere('organization_id', organizationId)
      .first()

    if (!user) {
      return null
    }

    if (trx) {
      user.useTransaction(trx)
    }

    user.merge(data)
    await user.save()

    return user
  }

  /**
   * Deletes a user from the database.
   * @param id - The ID of the user to delete.
   */
  async delete(id: number, trx?: TransactionClientContract): Promise<boolean> {
    const user = await User.find(id)
    if (!user) {
      return false
    }

    if (trx) {
      user.useTransaction(trx)
    }

    user.deletedAt = DateTime.now()
    await user.save()

    return true
  }

  /**
   * Finds a user by email or msisdn
   */
  async findByEmailOrMsisdn(identifier: string): Promise<User | null> {
    return await User.query().where('email', identifier).orWhere('msisdn', identifier).first()
  }

  /**
   * Finds a user by verification token
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return await User.query()
      .where('email_verification_token', token)
      .whereNotNull('email_verification_token')
      .first()
  }

  /**
   * Finds a user by password reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    return await User.query()
      .where('password_reset_token', token)
      .whereNotNull('password_reset_token')
      .first()
  }

  /**
   * Updates user password
   */
  async updatePassword(
    id: number,
    password: string,
    trx?: TransactionClientContract
  ): Promise<User | null> {
    const user = await User.find(id)
    if (!user) {
      return null
    }

    if (trx) {
      user.useTransaction(trx)
    }

    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpiresAt = undefined
    await user.save()

    return user
  }

  /**
   * Updates password reset token
   */
  async updateResetToken(
    id: number,
    token: string,
    expiresAt: DateTime,
    trx?: TransactionClientContract
  ): Promise<User | null> {
    const user = await User.find(id)
    if (!user) {
      return null
    }

    if (trx) {
      user.useTransaction(trx)
    }

    user.passwordResetToken = token
    user.passwordResetExpiresAt = expiresAt
    await user.save()

    return user
  }

  /**
   * Verifies user email
   */
  async verifyEmail(id: number, trx?: TransactionClientContract): Promise<User | null> {
    const user = await User.find(id)
    if (!user) {
      return null
    }

    if (trx) {
      user.useTransaction(trx)
    }

    user.emailVerifiedAt = DateTime.now()
    user.emailVerificationToken = undefined
    await user.save()

    return user
  }

  /**
   * Finds a user by ID with roles loaded
   */
  async findByIdWithRoles(id: number): Promise<User | null> {
    return await User.query().where('id', id).preload('roles').first()
  }
}
