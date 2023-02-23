const foo = function(
  {
    userId,
    userRepository,
  },
) {
  return userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue(userId);
};

module.exports = {
  foo: foo,
};

