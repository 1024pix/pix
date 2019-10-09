const logger = require('../../infrastructure/logger');
const tokenService = require('../../domain/services/token-service');
const checkUserIsAuthenticatedUseCase = require('../../application/usecases/checkUserIsAuthenticated');
const checkUserHasRolePixMasterUseCase = require('../../application/usecases/checkUserHasRolePixMaster');
const checkUserIsOwnerInOrganizationUseCase = require('../../application/usecases/checkUserIsOwnerInOrganization');
const checkUserBelongsToScoOrganizationAndManagesStudentsUseCase  = require('../../application/usecases/checkUserBelongsToScoOrganizationAndManagesStudents');

const JSONAPIError = require('jsonapi-serializer').Error;

function _replyWithAuthenticationError(h) {
  return Promise.resolve().then(() => {
    const errorHttpStatusCode = 401;

    const jsonApiError = new JSONAPIError({
      code: errorHttpStatusCode,
      title: 'Unauthorized access',
      detail: 'Missing or invalid access token in request auhorization headers.'
    });

    return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
  });
}

function _replyWithAuthorizationError(h) {
  return Promise.resolve().then(() => {
    const errorHttpStatusCode = 403;

    const jsonApiError = new JSONAPIError({
      code: errorHttpStatusCode,
      title: 'Forbidden access',
      detail: 'Missing or insufficient permissions.'
    });

    return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
  });
}

function checkUserIsAuthenticated(request, h) {

  const authorizationHeader = request.headers.authorization;
  const accessToken = tokenService.extractTokenFromAuthChain(authorizationHeader);

  if (!accessToken) {
    return _replyWithAuthenticationError(h);
  }

  return checkUserIsAuthenticatedUseCase.execute(accessToken)
    .then((authenticatedUser) => {
      if (authenticatedUser) {
        return h.authenticated({ credentials: { accessToken, userId: authenticatedUser.user_id } });
      }
      return _replyWithAuthenticationError(h);
    })
    .catch((err) => {
      logger.error(err);
      return _replyWithAuthenticationError(h);
    });
}

function checkUserHasRolePixMaster(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;

  return checkUserHasRolePixMasterUseCase.execute(userId)
    .then((hasRolePixMaster) => {
      if (hasRolePixMaster) {
        return h.response(true);
      }
      return _replyWithAuthorizationError(h);
    })
    .catch((err) => {
      logger.error(err);
      return _replyWithAuthorizationError(h);
    });
}

function checkRequestedUserIsAuthenticatedUser(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const authenticatedUserId = request.auth.credentials.userId;
  const requestedUserId = parseInt(request.params.userId) || parseInt(request.params.id);

  return authenticatedUserId === requestedUserId ? h.response(true) : _replyWithAuthorizationError(h);
}

function checkUserIsOwnerInOrganization(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  return checkUserIsOwnerInOrganizationUseCase.execute(userId, organizationId)
    .then((isOwnerInOrganization) => {
      if (isOwnerInOrganization) {
        return h.response(true);
      }
      return _replyWithAuthorizationError(h);
    })
    .catch((err) => {
      logger.error(err);
      return _replyWithAuthorizationError(h);
    });
}

async function checkUserIsOwnerInOrganizationOrHasRolePixMaster(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  const isOwnerInOrganization = await checkUserIsOwnerInOrganizationUseCase.execute(userId, organizationId);
  if (isOwnerInOrganization) {
    return h.response(true);
  }

  const hasRolePixMaster = await checkUserHasRolePixMasterUseCase.execute(userId);
  if (hasRolePixMaster) {
    return h.response(true);
  }

  return _replyWithAuthorizationError(h);
}

async function checkUserBelongsToScoOrganizationAndManagesStudents(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  let belongsToScoOrganizationAndManageStudents;
  try {
    belongsToScoOrganizationAndManageStudents = await checkUserBelongsToScoOrganizationAndManagesStudentsUseCase.execute(userId, organizationId);
  } catch (err) {
    logger.error(err);
    return _replyWithAuthorizationError(h);
  }

  if (belongsToScoOrganizationAndManageStudents) {
    return h.response(true);
  }

  return _replyWithAuthorizationError(h);
}

async function checkUserIsOwnerInScoOrganizationAndManagesStudents(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  const belongsToScoOrganizationAndManageStudents = await checkUserBelongsToScoOrganizationAndManagesStudentsUseCase.execute(userId, organizationId);
  if (belongsToScoOrganizationAndManageStudents) {

    const isOwnerInOrganization = await checkUserIsOwnerInOrganizationUseCase.execute(userId, organizationId);
    if (isOwnerInOrganization) {
      return h.response(true);
    }
  }

  return _replyWithAuthorizationError(h);
}

module.exports = {
  checkRequestedUserIsAuthenticatedUser,
  checkUserBelongsToScoOrganizationAndManagesStudents,
  checkUserHasRolePixMaster,
  checkUserIsAuthenticated,
  checkUserIsOwnerInOrganization,
  checkUserIsOwnerInOrganizationOrHasRolePixMaster,
  checkUserIsOwnerInScoOrganizationAndManagesStudents,
};
