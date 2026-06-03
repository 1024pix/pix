import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserToCreate } from '../models/UserToCreate.js';

/**
 * @param user
 * @param locale
 * @param hashedPassword
 * @param userToCreateRepository
 * @param authenticationMethodRepository
 * @return {Promise<*>}
 */
export async function createUserWithPassword({
  user,
  locale,
  hashedPassword,
  userToCreateRepository,
  authenticationMethodRepository,
}) {
  const userToAdd = UserToCreate.create({ ...user, locale });
  const savedUser = await userToCreateRepository.create({ user: userToAdd });

  const authenticationMethod = AuthenticationMethod.buildPixAuthenticationMethod({
    userId: savedUser.id,
    password: hashedPassword,
  });
  await authenticationMethodRepository.create({ authenticationMethod });

  return savedUser;
}

/**
 * @param userId
 * @param username
 * @param hashedPassword
 * @param authenticationMethodRepository
 * @param userRepository
 * @return {Promise<*|Promise<unknown>>}
 */
export async function updateUsernameAndAddPassword({
  userId,
  username,
  hashedPassword,
  authenticationMethodRepository,
  userRepository,
}) {
  return DomainTransaction.execute(async () => {
    await userRepository.updateUsername({ id: userId, username });
    return authenticationMethodRepository.createPasswordThatShouldBeChanged({ userId, hashedPassword });
  });
}

/**
 * @param user
 * @param samlId
 * @param hashedPassword
 * @param locale
 * @param authenticationMethodRepository
 * @param userToCreateRepository
 * @return {Promise<*|Promise<unknown>>}
 */
export async function createUserWithGarOrPassword({
  user,
  samlId,
  hashedPassword,
  locale,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const userToAdd = UserToCreate.create({ ...user, locale });

  return DomainTransaction.execute(async () => {
    let authenticationMethod;

    const createdUser = await userToCreateRepository.create({ user: userToAdd });

    if (samlId) {
      authenticationMethod = AuthenticationMethod.buildGARAuthenticationMethod({
        userId: createdUser.id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        externalIdentifier: samlId,
      });
    } else {
      authenticationMethod = AuthenticationMethod.buildPixAuthenticationMethod({
        userId: createdUser.id,
        password: hashedPassword,
      });
    }
    await authenticationMethodRepository.create({ authenticationMethod });

    return createdUser.id;
  });
}
