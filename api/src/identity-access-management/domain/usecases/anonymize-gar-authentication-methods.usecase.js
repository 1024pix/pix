import _ from 'lodash';

import { PIX_ADMIN } from '../../../authorization/domain/constants.js';
import { config } from '../../../shared/config.js';
import { EventLoggingJob } from '../../../shared/domain/models/jobs/EventLoggingJob.js';
import { eventLoggingJobRepository as injectedEventLoggingJobRepository } from '../../../shared/infrastructure/repositories/jobs/event-logging-job.repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';

const USER_IDS_BATCH_SIZE = 1000;

/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {Array<string>} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {EventLoggingJobRepository} params.eventLoggingJobRepository
 * @return {Promise<{garAnonymizedUserCount: number, total: number}>}
 */
export const anonymizeGarAuthenticationMethods = async function ({
  userIds,
  userIdsBatchSize = USER_IDS_BATCH_SIZE,
  adminMemberId,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  eventLoggingJobRepository = injectedEventLoggingJobRepository,
} = {}) {
  const userIdBatches = _.chunk(userIds, userIdsBatchSize);

  let garAnonymizedUserCount = 0;

  for (const userIdsBatch of userIdBatches) {
    const { garAnonymizedUserIds } = await authenticationMethodRepository.anonymizeByUserIds({ userIds: userIdsBatch });
    garAnonymizedUserCount += garAnonymizedUserIds.length;

    if (config.auditLogger.isEnabled && garAnonymizedUserIds?.length > 0) {
      await eventLoggingJobRepository.performAsync(
        EventLoggingJob.forUsers({
          client: 'PIX_ADMIN',
          action: 'ANONYMIZATION_GAR',
          userIds: garAnonymizedUserIds,
          updatedByUserId: adminMemberId,
          role: PIX_ADMIN.ROLES.SUPER_ADMIN,
        }),
      );
    }
  }

  return { garAnonymizedUserCount, total: userIds.length };
};
