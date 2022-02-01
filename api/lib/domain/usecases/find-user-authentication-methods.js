module.exports = function findUserAuthenticationMethods({ userId, authenticationMethodRepository }) {
  return authenticationMethodRepository.findByUserId({ userId });
};
