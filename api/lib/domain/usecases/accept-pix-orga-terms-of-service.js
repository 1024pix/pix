module.exports = function acceptPixOrgaTermsOfService({
  userId,
  userRepository
}) {
  return userRepository.get(userId)
    .then((user) => {
      if (user.pixOrgaTermsOfServiceAccepted) {
        return user;
      } else {
        user.pixOrgaTermsOfServiceAccepted = true;
        return userRepository.updateUser(user);
      }
    });
};
