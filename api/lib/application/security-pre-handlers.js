const tokenService = require('../domain/services/token-service');
const checkUserIsAuthenticatedUseCase = require('./usecases/checkUserIsAuthenticated');
const checkUserHasRolePixMasterUseCase = require('./usecases/checkUserHasRolePixMaster');
const checkUserIsAdminInOrganizationUseCase = require('./usecases/checkUserIsAdminInOrganization');
const checkUserBelongsToOrganizationManagingStudentsUseCase = require('./usecases/checkUserBelongsToOrganizationManagingStudents');
const checkUserBelongsToScoOrganizationAndManagesStudentsUseCase = require('./usecases/checkUserBelongsToScoOrganizationAndManagesStudents');
const checkUserBelongsToOrganizationUseCase = require('./usecases/checkUserBelongsToOrganization');
const checkUserIsAdminAndManagingStudentsForOrganization = require('./usecases/checkUserIsAdminAndManagingStudentsForOrganization');
const Organization = require('../../lib/domain/models/Organization');
const boom = require('boom');

const JSONAPIError = require('jsonapi-serializer').Error;
const _ = require('lodash');

function _replyWithAuthenticationError(h) {
  return Promise.resolve().then(() => {
    const errorHttpStatusCode = 401;

    const jsonApiError = new JSONAPIError({
      code: errorHttpStatusCode,
      title: 'Unauthorized access',
      detail: 'Missing or invalid access token in request auhorization headers.',
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
      detail: 'Missing or insufficient permissions.',
    });

    return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
  });
}

function checkUserIsAuthenticated(request, h) {

  if (request.auth.mode === 'optional' && !request.headers.authorization) {
    return boom.unauthorized(null, 'jwt-access-token');
  }

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
    .catch(() => _replyWithAuthenticationError(h));
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
    .catch(() => _replyWithAuthorizationError(h));
}

function checkRequestedUserIsAuthenticatedUser(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const authenticatedUserId = request.auth.credentials.userId;
  const requestedUserId = parseInt(request.params.userId) || parseInt(request.params.id);

  return authenticatedUserId === requestedUserId ? h.response(true) : _replyWithAuthorizationError(h);
}

function checkUserIsAdminInOrganization(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;

  //organizationId can be retrieved from path param in case organizations/id/invitations api or from memberships payload in case memberships/id
  const organizationId = (request.path && request.path.includes('memberships')) ? request.payload.data.relationships.organization.data.id : parseInt(request.params.id) ;

  return checkUserIsAdminInOrganizationUseCase.execute(userId, organizationId)
    .then((isAdminInOrganization) => {
      if (isAdminInOrganization) {
        return h.response(true);
      }
      return _replyWithAuthorizationError(h);
    })
    .catch(() => _replyWithAuthorizationError(h));
}

async function checkUserBelongsToOrganizationOrHasRolePixMaster(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  const belongsToOrganization = await checkUserBelongsToOrganizationUseCase.execute(userId, organizationId);
  if (belongsToOrganization) {
    return h.response(true);
  }

  const hasRolePixMaster = await checkUserHasRolePixMasterUseCase.execute(userId);
  if (hasRolePixMaster) {
    return h.response(true);
  }

  return _replyWithAuthorizationError(h);
}

async function checkUserIsAdminInOrganizationOrHasRolePixMaster(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  //organizationId can be retrieved from path param in case organizations/id/invitations api or from memberships payload in case memberships/id
  const organizationId = (request.path && request.path.includes('memberships')) ? request.payload.data.relationships.organization.data.id : parseInt(request.params.id) ;

  const isAdminInOrganization = await checkUserIsAdminInOrganizationUseCase.execute(userId, organizationId);
  if (isAdminInOrganization) {
    return h.response(true);
  }

  const hasRolePixMaster = await checkUserHasRolePixMasterUseCase.execute(userId);
  if (hasRolePixMaster) {
    return h.response(true);
  }

  return _replyWithAuthorizationError(h);
}

async function checkUserBelongsToOrganizationManagingStudents(request, h) {
  if (!_.has(request, 'auth.credentials.userId')) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  try {
    if (await checkUserBelongsToOrganizationManagingStudentsUseCase.execute(userId, organizationId)) {
      return h.response(true);
    }
  } catch (err) {
    return _replyWithAuthorizationError(h);
  }
  return _replyWithAuthorizationError(h);
}

async function checkUserBelongsToScoOrganizationAndManagesStudents(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyWithAuthorizationError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id) || parseInt(request.payload.data.attributes['organization-id']);

  let belongsToScoOrganizationAndManageStudents;
  try {
    belongsToScoOrganizationAndManageStudents = await checkUserBelongsToScoOrganizationAndManagesStudentsUseCase.execute(userId, organizationId);
  } catch (err) {
    return _replyWithAuthorizationError(h);
  }

  if (belongsToScoOrganizationAndManageStudents) {
    return h.response(true);
  }

  return _replyWithAuthorizationError(h);
}

async function checkUserIsAdminInSCOOrganizationManagingStudents(request, h) {
  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  if (await checkUserIsAdminAndManagingStudentsForOrganization.execute(userId, organizationId, Organization.types.SCO)) {
    return h.response(true);
  }
  return _replyWithAuthorizationError(h);
}

async function checkUserIsAdminInSUPOrganizationManagingStudents(request, h) {
  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  if (await checkUserIsAdminAndManagingStudentsForOrganization.execute(userId, organizationId, Organization.types.SUP)) {
    return h.response(true);
  }

  return _replyWithAuthorizationError(h);
}

module.exports = {
  checkRequestedUserIsAuthenticatedUser,
  checkUserBelongsToOrganizationOrHasRolePixMaster,
  checkUserBelongsToOrganizationManagingStudents,
  checkUserBelongsToScoOrganizationAndManagesStudents,
  checkUserHasRolePixMaster,
  checkUserIsAuthenticated,
  checkUserIsAdminInOrganization,
  checkUserIsAdminInOrganizationOrHasRolePixMaster,
  checkUserIsAdminInSCOOrganizationManagingStudents,
  checkUserIsAdminInSUPOrganizationManagingStudents,
};
