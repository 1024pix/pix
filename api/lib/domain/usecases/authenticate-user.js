const encryptionService = require('../../domain/services/encryption-service');
const { MissingOrInvalidCredentialsError, ForbiddenAccess } = require('../../domain/errors');

function _canUserAccessScope(scope, user) {
  if (scope === 'pix-orga' && !user.isLinkedToOrganizations()) {
    return Promise.reject(new ForbiddenAccess('User is not allowed to access this area'));
  }
  return Promise.resolve();
}

module.exports = function({ userEmail, password, scope, userRepository, tokenService }) {
  let user;
  return userRepository.findByEmailWithRoles(userEmail.toLowerCase())
    .then(foundUser => (user = foundUser))
    .then(() => _canUserAccessScope(scope, user))
    .then(() => encryptionService.check(password, user.password))
    .then(() => tokenService.createTokenFromUser(user))
    .catch((error) => {
      if (error instanceof ForbiddenAccess) {
        throw error;
      }

      throw new MissingOrInvalidCredentialsError();
    });
};
