import jsonapiSerializer from 'jsonapi-serializer';

import * as userMembershipsRepository from '../infrastructure/repositories/user-memberships-repository.js';
const { Error: JSONAPIError } = jsonapiSerializer;

async function checkUserIsMemberOfCertificationCenter(request, h, dependencies = { userMembershipsRepository }) {
  try {
    const userId = Number(request.auth.credentials.userId);
    const certificationCenterId = Number(request.params.certificationCenterId);
    if (!userId || !certificationCenterId) {
      return _replyForbiddenError(h);
    }

    const userMemberships = await dependencies.userMembershipsRepository.findByUserId({ userId });

    return userMemberships.isMemberOf(certificationCenterId) ? h.response(true) : _replyForbiddenError(h);
  } catch {
    return _replyForbiddenError(h);
  }
}

async function checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
  request,
  h,
  dependencies = { userMembershipsRepository },
) {
  try {
    const userId = Number(request.auth.credentials.userId);
    const certificationCenterMembershipId = Number(request.params.certificationCenterMembershipId);
    if (!userId || !certificationCenterMembershipId) {
      return _replyForbiddenError(h);
    }

    const userMemberships = await dependencies.userMembershipsRepository.findByUserId({ userId });

    return userMemberships.isAdminOfPeer(certificationCenterMembershipId) ? h.response(true) : _replyForbiddenError(h);
  } catch {
    return _replyForbiddenError(h);
  }
}

async function checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId(
  request,
  h,
  dependencies = { userMembershipsRepository },
) {
  try {
    const userId = Number(request.auth.credentials.userId);
    const certificationCenterInvitationId = Number(request.params.certificationCenterInvitationId);
    if (!userId || !certificationCenterInvitationId) {
      return _replyForbiddenError(h);
    }

    const userMemberships = await dependencies.userMembershipsRepository.findByUserId({ userId });

    return userMemberships.isAdminOfInvitation(certificationCenterInvitationId)
      ? h.response(true)
      : _replyForbiddenError(h);
  } catch {
    return _replyForbiddenError(h);
  }
}

async function checkUserIsAdminOfCertificationCenter(request, h, dependencies = { userMembershipsRepository }) {
  try {
    const userId = Number(request.auth.credentials.userId);
    const certificationCenterId = Number(request.params.certificationCenterId);
    if (!userId || !certificationCenterId) {
      return _replyForbiddenError(h);
    }

    const userMemberships = await dependencies.userMembershipsRepository.findByUserId({ userId });

    return userMemberships.isAdminOf(certificationCenterId) ? h.response(true) : _replyForbiddenError(h);
  } catch {
    return _replyForbiddenError(h);
  }
}

async function checkCertificationCenterIsNotScoManagingStudents(
  request,
  h,
  dependencies = {
    userMembershipsRepository,
  },
) {
  try {
    const userId = Number(request.auth.credentials.userId);
    const certificationCenterIdRaw =
      request?.params?.certificationCenterId || request?.payload?.data?.attributes?.certificationCenterId;
    const certificationCenterId = Number(certificationCenterIdRaw);
    if (!userId || !certificationCenterId) {
      return _replyForbiddenError(h);
    }

    const userMemberships = await dependencies.userMembershipsRepository.findByUserId({ userId });
    return userMemberships.isMemberOfScoManagingStudents(certificationCenterId)
      ? h.response(true)
      : _replyForbiddenError(h);
  } catch {
    return _replyForbiddenError(h);
  }
}

function _replyForbiddenError(h) {
  const errorHttpStatusCode = 403;

  const jsonApiError = new JSONAPIError({
    code: errorHttpStatusCode,
    title: 'Forbidden access',
    detail: 'Missing or insufficient permissions.',
  });

  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

export const securityPreHandlers = {
  checkUserIsMemberOfCertificationCenter,
  checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId,
  checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId,
  checkUserIsAdminOfCertificationCenter,
  checkCertificationCenterIsNotScoManagingStudents,
};
