const { UserNotAuthorizedToUpdateResourceError } = require('../../domain/errors');

module.exports = function acceptPixOrgaTermsOfService({
  authenticatedUserId,
  requestedUserId,
  userRepository
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToUpdateResourceError();
  }

  return userRepository.get(requestedUserId)
    .then((user) => {
      if (user.pixOrgaTermsOfServiceAccepted) {
        return user;
      } else {
        user.pixOrgaTermsOfServiceAccepted = true;
        return userRepository.updateUser(user);
      }
    });

};
