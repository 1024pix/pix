const encryptionService = require('../../domain/services/encryption-service');
const { MissingOrInvalidCredentialsError, ForbiddenAccess } = require('../../domain/errors');
const apps = require('../../apps-messages');

function _checkUserAccessScope(scope, user) {

  if (scope === apps.PIX_ORGA.SCOPE && !user.isLinkedToOrganizations())
  {
    throw new ForbiddenAccess(apps.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
  }

  if (scope === apps.PIX_ADMIN.SCOPE && !user.hasRolePixMaster())
  {
    throw new ForbiddenAccess(apps.PIX_ADMIN.NOT_PIXMASTER_MSG);
  }

  if (scope === apps.PIX_CERTIF.SCOPE && !user.isLinkedToCertificationCenters())
  {
    throw new ForbiddenAccess(apps.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG);
  }
}

module.exports = function authenticateUser({
  password,
  scope,
  tokenService,
  username,
  userRepository,
}) {
  let user;
  return userRepository.getByUsernameOrEmailWithRoles(username)
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
