const { UserNotAuthorizedToUpdateResourceError } = require('../../domain/errors');

module.exports = function acceptPixCertifTermsOfService({
  authenticatedUserId,
  requestedUserId,
  userRepository
}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToUpdateResourceError();
  }

  return userRepository.get(requestedUserId)
    .then((user) => {
      if (user.pixCertifTermsOfServiceAccepted) {
        return user;
      } else {
        user.pixCertifTermsOfServiceAccepted = true;
        return userRepository.updateUser(user);
      }
    });

};
