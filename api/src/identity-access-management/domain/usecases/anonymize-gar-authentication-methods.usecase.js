import _ from 'lodash';

import { config } from '../../../shared/config.js';
import { GarAuthenticationMethodAnonymized } from '../models/GarAuthenticationMethodAnonymized.js';

const USER_IDS_BATCH_SIZE = 1000;

/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {Array<string>} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {DomainTransaction} params.domainTransaction
 * @param {GarAnonymizedBatchEventsLoggingJob} params.garAnonymizedBatchEventsLoggingJob
 * @return {Promise<{garAnonymizedUserCount: number, total: number}>}
 */
export const anonymizeGarAuthenticationMethods = async function ({
  userIds,
  userIdsBatchSize = USER_IDS_BATCH_SIZE,
  adminMemberId,
  authenticationMethodRepository,
  garAnonymizedBatchEventsLoggingJob,
}) {
  const userIdBatches = _.chunk(userIds, userIdsBatchSize);

  let garAnonymizedUserCount = 0;

  for (const userIdsBatch of userIdBatches) {
    const { garAnonymizedUserIds } = await authenticationMethodRepository.anonymizeByUserIds({ userIds: userIdsBatch });
    garAnonymizedUserCount += garAnonymizedUserIds.length;

    if (config.auditLogger.isEnabled) {
      const payload = new GarAuthenticationMethodAnonymized({
        userIds: garAnonymizedUserIds,
        updatedByUserId: adminMemberId,
      });
      await garAnonymizedBatchEventsLoggingJob.schedule(payload);
    }
  }

  return { garAnonymizedUserCount, total: userIds.length };
};
