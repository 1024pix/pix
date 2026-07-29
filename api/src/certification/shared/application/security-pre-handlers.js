import jsonapiSerializer from 'jsonapi-serializer';

import * as userMembershipsRepository from '../infrastructure/repositories/user-memberships-repository.js';
const { Error: JSONAPIError } = jsonapiSerializer;

async function checkUserIsMemberOfCertificationCenter(request, h, dependencies = { userMembershipsRepository }) {
  try {
    if (!request.auth?.credentials?.userId) {
      return _replyForbiddenError(h);
    }

    const userId = Number(request.auth.credentials.userId);
    const certificationCenterId = Number(request.params.certificationCenterId);

    const userMemberships = await dependencies.userMembershipsRepository.findByUserId({ userId });

    return userMemberships.isMemberOf(certificationCenterId) ? h.response(true) : _replyForbiddenError(h);
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
};
