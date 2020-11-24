const authenticationService = require('../../domain/services/authentication-service');
const { MissingOrInvalidCredentialsError, ForbiddenAccess, UserShouldChangePasswordError } = require('../../domain/errors');
const apps = require('../constants');
const config = require('../../config');

function _checkUserAccessScope(scope, user) {

  if (scope === apps.PIX_ORGA.SCOPE && !user.isLinkedToOrganizations())
  {
    throw new ForbiddenAccess(apps.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
  }

  if (scope === apps.PIX_ADMIN.SCOPE && !user.hasRolePixMaster)
  {
    throw new ForbiddenAccess(apps.PIX_ADMIN.NOT_PIXMASTER_MSG);
  }

  if (scope === apps.PIX_CERTIF.SCOPE && config.featureToggles.certifBlockingScoUserAccess) {
    throw new ForbiddenAccess(apps.PIX_CERTIF.USER_SCO_BLOCKED_CERTIFICATION_MSG);
  }

  if (scope === apps.PIX_CERTIF.SCOPE && !user.isLinkedToCertificationCenters())
  {
    throw new ForbiddenAccess(apps.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG);
  }
}

module.exports = async function authenticateUser({
  password,
  scope,
  source,
  tokenService,
  username,
  userRepository,
}) {
  try {
    const foundUser = await authenticationService.getUserByUsernameAndPassword({ username, password, userRepository });

    if (!foundUser.shouldChangePassword) {
      _checkUserAccessScope(scope, foundUser);
      return tokenService.createAccessTokenFromUser(foundUser, source);
    } else {
      throw new UserShouldChangePasswordError();
    }
  } catch (error) {
    if (error instanceof ForbiddenAccess
      || error instanceof UserShouldChangePasswordError) {
      throw error;
    }
    throw new MissingOrInvalidCredentialsError();
  }
};
