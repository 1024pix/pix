const has = require('lodash/has');
const {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
} = require('../errors.js');

module.exports = async function updateUserDetailsForAdministration({
  userId,
  userDetailsForAdministration,
  userRepository,
}) {
  const { email, username } = userDetailsForAdministration;

  const foundUsersWithEmailAlreadyUsed = email && (await userRepository.findAnotherUserByEmail(userId, email));
  const foundUsersWithUsernameAlreadyUsed =
    username && (await userRepository.findAnotherUserByUsername(userId, username));

  await _checkEmailAndUsernameAreAvailable({
    usersWithEmail: foundUsersWithEmailAlreadyUsed,
    usersWithUsername: foundUsersWithUsernameAlreadyUsed,
  });

  const userMustValidateTermsOfService = await _isAddingEmailForFirstTime({ userId, email, userRepository });
  if (userMustValidateTermsOfService) {
    userDetailsForAdministration.mustValidateTermsOfService = true;
  }

  await userRepository.updateUserDetailsForAdministration({ id: userId, userAttributes: userDetailsForAdministration });

  return userRepository.getUserDetailsForAdmin(userId);
};

async function _checkEmailAndUsernameAreAvailable({ usersWithEmail, usersWithUsername }) {
  const isEmailAlreadyUsed = has(usersWithEmail, '[0].email');
  const isUsernameAlreadyUsed = has(usersWithUsername, '[0].username');

  if (isEmailAlreadyUsed && isUsernameAlreadyUsed) {
    throw new AlreadyRegisteredEmailAndUsernameError();
  } else if (isEmailAlreadyUsed) {
    throw new AlreadyRegisteredEmailError();
  } else if (isUsernameAlreadyUsed) {
    throw new AlreadyRegisteredUsernameError();
  }
}

async function _isAddingEmailForFirstTime({ userId, email, userRepository }) {
  const user = await userRepository.get(userId);
  const userWithoutEmail = !user.email;
  const userHasUsername = !!user.username;
  const shouldChangeEmail = !!email;
  return userWithoutEmail && userHasUsername && shouldChangeEmail;
}
