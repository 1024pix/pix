import { config } from '../../../shared/config.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { GarAuthenticationMethodAnonymized } from '../models/GarAuthenticationMethodAnonymized.js';

/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {string} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {DomainTransaction} params.domainTransaction
 * @param {GarAnonymizedBatchEventsLoggingJob} params.garAnonymizedBatchEventsLoggingJob
 * @return {Promise<{garAnonymizedUserCount: number, total: number}>}
 */
export const anonymizeGarAuthenticationMethods = async function ({
  userIds,
  adminMemberId,
  authenticationMethodRepository,
  garAnonymizedBatchEventsLoggingJob,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const total = userIds.length;

  const { garAnonymizedUserIds } = await authenticationMethodRepository.batchAnonymizeByUserIds(
    { userIds },
    { domainTransaction },
  );

  if (config.auditLogger.isEnabled) {
    const payload = new GarAuthenticationMethodAnonymized({
      userIds: garAnonymizedUserIds,
      updatedByUserId: adminMemberId,
    });
    await garAnonymizedBatchEventsLoggingJob.schedule(payload);
  }

  return { garAnonymizedUserCount: garAnonymizedUserIds.length, total };
};
