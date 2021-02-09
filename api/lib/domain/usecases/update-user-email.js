const { UserNotAuthorizedToUpdateEmailError } = require('../errors');

module.exports = async function updateUserEmail({
  email,
  userId,
  authenticatedUserId,
  userRepository,
}) {
  if (userId !== authenticatedUserId) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  await userRepository.isEmailAvailable(email);
  await userRepository.updateEmail({ id: userId, email: email.toLowerCase() });
};
