const { UserNotAuthorizedToUpdateEmailError } = require('../errors');
const isEmpty = require('lodash/isEmpty');

module.exports = async function updateUserEmail({
  email,
  userId,
  userRepository,
  schoolingRegistrationRepository,
}) {
  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  const schoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });
  if (!isEmpty(schoolingRegistrations)) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  await userRepository.isEmailAvailable(email);
  await userRepository.updateEmail({ id: userId, email: email.toLowerCase() });
};
