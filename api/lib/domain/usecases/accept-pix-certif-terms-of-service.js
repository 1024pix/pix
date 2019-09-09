module.exports = function acceptPixCertifTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.get(userId)
    .then((user) => {
      if (user.pixCertifTermsOfServiceAccepted) {
        return user;
      } else {
        user.pixCertifTermsOfServiceAccepted = true;
        return userRepository.updateUser(user);
      }
    });
};
