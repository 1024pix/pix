import { UserIsBlocked, UserIsTemporaryBlocked } from '../../../shared/domain/errors.js';

export async function assertUserIsBlocked({ emailOrUsername, userRepository, userLoginRepository }) {
  const foundUserLogin = await userLoginRepository.findByUsername(emailOrUsername);

  if (!foundUserLogin) return;

  const foundUser = await userRepository.get(foundUserLogin.userId);

  const isLoginFailureWithUsername = emailOrUsername === foundUser.username;

  if (foundUserLogin.isUserMarkedAsBlocked()) {
    throw new UserIsBlocked({ isLoginFailureWithUsername });
  }

  if (foundUserLogin.isUserMarkedAsTemporaryBlocked()) {
    throw new UserIsTemporaryBlocked({
      isLoginFailureWithUsername,
      blockingDurationMs: foundUserLogin.computeBlockingDurationMs(),
    });
  }
}
