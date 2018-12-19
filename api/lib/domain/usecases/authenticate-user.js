const encryptionService = require('../../domain/services/encryption-service');
const { MissingOrInvalidCredentialsError, ForbiddenAccess } = require('../../domain/errors');

function _checkUserAccessScope(scope, user) {
  if (
    (scope === 'pix-orga' && !user.isLinkedToOrganizations()) ||
    (scope === 'pix-admin' && !user.hasRolePixMaster) ||
    (scope === 'pix-certif' && !user.hasRolePixMaster)
  ) {
    throw new ForbiddenAccess('User is not allowed to access this area');
  }
}

module.exports = function authenticateUser({
  password,
  scope,
  tokenService,
  userEmail,
  userRepository,
}) {
  let user;
  return userRepository.findByEmailWithRoles(userEmail.toLowerCase())
    .then((foundUser) => (user = foundUser))
    .then(() => _checkUserAccessScope(scope, user))
    .then(() => encryptionService.check(password, user.password))
    .then(() => tokenService.createTokenFromUser(user, 'pix'))
    .catch((error) => {
      if (error instanceof ForbiddenAccess) {
        throw error;
      }

      throw new MissingOrInvalidCredentialsError();
    });
};
