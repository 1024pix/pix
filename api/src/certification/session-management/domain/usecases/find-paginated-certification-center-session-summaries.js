import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import * as injectedUserRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { sessionSummaryRepository as injectedSessionSummaryRepository } from '../../infrastructure/repositories/index.js';

const findPaginatedCertificationCenterSessionSummaries = async function ({
  userId,
  certificationCenterId,
  page,
  sessionSummaryRepository = injectedSessionSummaryRepository,
  userRepository = injectedUserRepository,
} = {}) {
  const user = await userRepository.getWithCertificationCenterMemberships(userId);
  if (!user.hasAccessToCertificationCenter(certificationCenterId)) {
    throw new ForbiddenAccess(`User ${userId} is not a member of certification center ${certificationCenterId}`);
  }

  return sessionSummaryRepository.findPaginatedByCertificationCenterId({ certificationCenterId, page });
};

export { findPaginatedCertificationCenterSessionSummaries };
