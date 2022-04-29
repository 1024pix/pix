/* eslint-disable  no-restricted-syntax */
const bluebird = require('bluebird');
const checkUserHasRoleSuperAdminUseCase = require('./usecases/checkUserHasRoleSuperAdmin');
const checkUserHasRoleCertifUseCase = require('./usecases/checkUserHasRoleCertif');
const checkUserHasRoleSupportUseCase = require('./usecases/checkUserHasRoleSupport');
const checkUserHasRoleMetierUseCase = require('./usecases/checkUserHasRoleMetier');
const checkUserIsAdminInOrganizationUseCase = require('./usecases/checkUserIsAdminInOrganization');
const checkUserBelongsToOrganizationManagingStudentsUseCase = require('./usecases/checkUserBelongsToOrganizationManagingStudents');
const checkUserBelongsToScoOrganizationAndManagesStudentsUseCase = require('./usecases/checkUserBelongsToScoOrganizationAndManagesStudents');
const checkUserBelongsToSupOrganizationAndManagesStudentsUseCase = require('./usecases/checkUserBelongsToSupOrganizationAndManagesStudents');
const checkUserBelongsToOrganizationUseCase = require('./usecases/checkUserBelongsToOrganization');
const checkUserIsAdminAndManagingStudentsForOrganization = require('./usecases/checkUserIsAdminAndManagingStudentsForOrganization');
const checkUserIsMemberOfAnOrganizationUseCase = require('./usecases/checkUserIsMemberOfAnOrganization');
const checkUserIsMemberOfCertificationCenterUsecase = require('./usecases/checkUserIsMemberOfCertificationCenter');
const checkAuthorizationToManageCampaignUsecase = require('./usecases/checkAuthorizationToManageCampaign');
const Organization = require('../../lib/domain/models/Organization');

const JSONAPIError = require('jsonapi-serializer').Error;
const has = require('lodash/has');

function _replyForbiddenError(h) {
  const errorHttpStatusCode = 403;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Forbidden access',
    detail: 'Missing or insufficient permissions.',
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

async function checkUserHasRoleSuperAdmin(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;

  try {
    const hasRoleSuperAdmin = await checkUserHasRoleSuperAdminUseCase.execute(userId);
    if (hasRoleSuperAdmin) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (e) {
    return _replyForbiddenError(h);
  }
}

async function checkUserHasRoleCertif(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;

  try {
    const hasRoleCertif = await checkUserHasRoleCertifUseCase.execute(userId);
    if (hasRoleCertif) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (e) {
    return _replyForbiddenError(h);
  }
}

async function checkUserHasRoleSupport(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;

  try {
    const hasRoleSupport = await checkUserHasRoleSupportUseCase.execute(userId);
    if (hasRoleSupport) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (e) {
    return _replyForbiddenError(h);
  }
}

async function checkUserHasRoleMetier(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;

  try {
    const hasRoleMetier = await checkUserHasRoleMetierUseCase.execute(userId);
    if (hasRoleMetier) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (e) {
    return _replyForbiddenError(h);
  }
}

function checkRequestedUserIsAuthenticatedUser(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const authenticatedUserId = request.auth.credentials.userId;
  const requestedUserId = parseInt(request.params.userId) || parseInt(request.params.id);

  return authenticatedUserId === requestedUserId ? h.response(true) : _replyForbiddenError(h);
}

function checkUserIsAdminInOrganization(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;

  //organizationId can be retrieved from path param in case organizations/id/invitations api or from memberships payload in case memberships/id
  const organizationId =
    request.path && request.path.includes('memberships')
      ? request.payload.data.relationships.organization.data.id
      : parseInt(request.params.id);

  return checkUserIsAdminInOrganizationUseCase
    .execute(userId, organizationId)
    .then((isAdminInOrganization) => {
      if (isAdminInOrganization) {
        return h.response(true);
      }
      return _replyForbiddenError(h);
    })
    .catch(() => _replyForbiddenError(h));
}

function checkUserIsMemberOfCertificationCenter(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const certificationCenterId = parseInt(request.params.certificationCenterId);

  return checkUserIsMemberOfCertificationCenterUsecase
    .execute(userId, certificationCenterId)
    .then((isMemberInCertificationCenter) => {
      if (isMemberInCertificationCenter) {
        return h.response(true);
      }
      return _replyForbiddenError(h);
    })
    .catch(() => _replyForbiddenError(h));
}

async function checkUserBelongsToOrganizationManagingStudents(request, h) {
  if (!has(request, 'auth.credentials.userId')) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  try {
    if (await checkUserBelongsToOrganizationManagingStudentsUseCase.execute(userId, organizationId)) {
      return h.response(true);
    }
  } catch (err) {
    return _replyForbiddenError(h);
  }
  return _replyForbiddenError(h);
}

async function checkUserBelongsToScoOrganizationAndManagesStudents(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id) || parseInt(request.payload.data.attributes['organization-id']);

  let belongsToScoOrganizationAndManageStudents;
  try {
    belongsToScoOrganizationAndManageStudents =
      await checkUserBelongsToScoOrganizationAndManagesStudentsUseCase.execute(userId, organizationId);
  } catch (err) {
    return _replyForbiddenError(h);
  }

  if (belongsToScoOrganizationAndManageStudents) {
    return h.response(true);
  }

  return _replyForbiddenError(h);
}

async function checkUserBelongsToSupOrganizationAndManagesStudents(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id) || parseInt(request.payload.data.attributes['organization-id']);

  let belongsToSupOrganizationAndManageStudents;
  try {
    belongsToSupOrganizationAndManageStudents =
      await checkUserBelongsToSupOrganizationAndManagesStudentsUseCase.execute(userId, organizationId);
  } catch (err) {
    return _replyForbiddenError(h);
  }

  if (belongsToSupOrganizationAndManageStudents) {
    return h.response(true);
  }

  return _replyForbiddenError(h);
}

async function checkUserIsAdminInSCOOrganizationManagingStudents(request, h) {
  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  if (
    await checkUserIsAdminAndManagingStudentsForOrganization.execute(userId, organizationId, Organization.types.SCO)
  ) {
    return h.response(true);
  }
  return _replyForbiddenError(h);
}

async function checkUserIsAdminInSUPOrganizationManagingStudents(request, h) {
  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  if (
    await checkUserIsAdminAndManagingStudentsForOrganization.execute(userId, organizationId, Organization.types.SUP)
  ) {
    return h.response(true);
  }

  return _replyForbiddenError(h);
}

async function checkUserBelongsToOrganization(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;
  const organizationId = parseInt(request.params.id);

  const belongsToOrganization = await checkUserBelongsToOrganizationUseCase.execute(userId, organizationId);
  if (belongsToOrganization) {
    return h.response(true);
  }
  return _replyForbiddenError(h);
}

async function checkUserIsMemberOfAnOrganization(request, h) {
  if (!request.auth.credentials || !request.auth.credentials.userId) {
    return _replyForbiddenError(h);
  }

  const userId = request.auth.credentials.userId;

  let isMemberOfAnOrganization;
  try {
    isMemberOfAnOrganization = await checkUserIsMemberOfAnOrganizationUseCase.execute(userId);
  } catch (err) {
    return _replyForbiddenError(h);
  }

  if (isMemberOfAnOrganization) {
    return h.response(true);
  }
  return _replyForbiddenError(h);
}

async function checkAuthorizationToManageCampaign(request, h) {
  const userId = request.auth.credentials.userId;
  const campaignId = request.params.id;
  const isAdminOrOwnerOfTheCampaign = await checkAuthorizationToManageCampaignUsecase.execute({
    userId,
    campaignId,
  });

  if (isAdminOrOwnerOfTheCampaign) return h.response(true);
  return _replyForbiddenError(h);
}

function userHasAtLeastOneAccessOf(securityChecks) {
  return async (request, h) => {
    const responses = await bluebird.map(securityChecks, (securityCheck) => securityCheck(request, h));
    const hasAccess = responses.some((response) => !response.source?.errors);
    return hasAccess ? hasAccess : _replyForbiddenError(h);
  };
}

/* eslint-enable no-restricted-syntax */

module.exports = {
  checkRequestedUserIsAuthenticatedUser,
  checkUserBelongsToOrganizationManagingStudents,
  checkUserBelongsToScoOrganizationAndManagesStudents,
  checkUserBelongsToSupOrganizationAndManagesStudents,
  checkUserHasRoleSuperAdmin,
  checkUserHasRoleCertif,
  checkUserHasRoleSupport,
  checkUserHasRoleMetier,
  checkUserIsAdminInOrganization,
  checkAuthorizationToManageCampaign,
  checkUserIsAdminInSCOOrganizationManagingStudents,
  checkUserIsAdminInSUPOrganizationManagingStudents,
  checkUserBelongsToOrganization,
  checkUserIsMemberOfAnOrganization,
  checkUserIsMemberOfCertificationCenter,
  userHasAtLeastOneAccessOf,
};
