import { PasswordNotMatching } from '../../errors';
import encryptionService from '../encryption-service';
import userLoginRepository from '../../../infrastructure/repositories/user-login-repository';

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  let userLogin = await userLoginRepository.findByUserId(foundUser.id);
  if (!userLogin) {
    userLogin = await userLoginRepository.create({ userId: foundUser.id });
  }

  try {
    await encryptionService.checkPassword({
      password,
      passwordHash,
    });
  } catch (error) {
    if (error instanceof PasswordNotMatching) {
      userLogin.incrementFailureCount();

      if (userLogin.shouldMarkUserAsBlocked()) {
        userLogin.markUserAsBlocked();
      } else if (userLogin.shouldMarkUserAsTemporarilyBlocked()) {
        userLogin.markUserAsTemporarilyBlocked();
      }

      await userLoginRepository.update(userLogin);
    }

    throw error;
  }

  if (userLogin.hasFailedAtLeastOnce()) {
    userLogin.resetUserTemporaryBlocking();
    await userLoginRepository.update(userLogin);
  }

  return foundUser;
}

export default {
  getUserByUsernameAndPassword,
};
