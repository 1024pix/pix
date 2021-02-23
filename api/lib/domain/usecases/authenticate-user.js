const get = require('lodash/get');

const {
  ForbiddenAccess,
  MissingOrInvalidCredentialsError,
  UserShouldChangePasswordError,
} = require('../../domain/errors');

const apps = require('../constants');
const authenticationService = require('../../domain/services/authentication-service');

function _checkUserAccessScope(scope, user) {
  if (scope === apps.PIX_ORGA.SCOPE && !user.isLinkedToOrganizations()) {
    throw new ForbiddenAccess(apps.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
  }

  if (scope === apps.PIX_ADMIN.SCOPE && !user.hasRolePixMaster) {
    throw new ForbiddenAccess(apps.PIX_ADMIN.NOT_PIXMASTER_MSG);
  }

  if (scope === apps.PIX_CERTIF.SCOPE && !user.isLinkedToCertificationCenters()) {
    throw new ForbiddenAccess(apps.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG);
  }
}

module.exports = async function authenticateUser({
  password,
  scope,
  source,
  username,
  tokenService,
  userRepository,
}) {
  try {
    const foundUser = await authenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    const shouldChangePassword = get(foundUser, 'authenticationMethods[0].authenticationComplement.shouldChangePassword');

    if (!shouldChangePassword) {
      _checkUserAccessScope(scope, foundUser);
      return tokenService.createAccessTokenFromUser(foundUser.id, source);
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
