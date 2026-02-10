import { test } from '@japa/runner'
import { UserRepository } from '#repositories/user_repository'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('UserRepository', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.teardown(() => testUtils.db().rollbackGlobalTransaction())

  test('should find user by email', async ({ assert }) => {
    // Arrange
    const repository = new UserRepository()
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })

    // Act
    const found = await repository.findByEmail('test@example.com')

    // Assert
    assert.exists(found)
    assert.equal(found?.id, user.id)
    assert.equal(found?.email, 'test@example.com')
  })

  test('should return null when user does not exist', async ({ assert }) => {
    // Arrange
    const repository = new UserRepository()

    // Act
    const found = await repository.findByEmail('nonexistent@example.com')

    // Assert
    assert.isNull(found)
  })

  test('should find user by msisdn', async ({ assert }) => {
    // Arrange
    const repository = new UserRepository()
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      msisdn: '+5511999999999',
      password: 'password123',
    })

    // Act
    const found = await repository.findByMsisdn('+5511999999999')

    // Assert
    assert.exists(found)
    assert.equal(found?.id, user.id)
    assert.equal(found?.msisdn, '+5511999999999')
  })

  test('should create user', async ({ assert }) => {
    // Arrange
    const repository = new UserRepository()
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    }

    // Act
    const user = await repository.create(userData)

    // Assert
    assert.exists(user.id)
    assert.equal(user.name, 'New User')
    assert.equal(user.email, 'newuser@example.com')
  })
})
