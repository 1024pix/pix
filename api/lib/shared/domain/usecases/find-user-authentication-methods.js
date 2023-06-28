const findUserAuthenticationMethods = function ({ userId, authenticationMethodRepository }) {
  return authenticationMethodRepository.findByUserId({ userId });
};

export { findUserAuthenticationMethods };
