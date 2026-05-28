import _ from 'lodash';

import { PIX_ADMIN } from '../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';

const USER_IDS_BATCH_SIZE = 1000;

/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {Array<string>} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {AuditLoggingJobRepository} params.auditLoggingJobRepository
 * @return {Promise<{garAnonymizedUserCount: number, total: number}>}
 */
export const anonymizeGarAuthenticationMethods = async function ({
  userIds,
  userIdsBatchSize = USER_IDS_BATCH_SIZE,
  adminMemberId,
  authenticationMethodRepository,
  auditLoggingJobRepository,
}) {
  const userIdBatches = _.chunk(userIds, userIdsBatchSize);

  let garAnonymizedUserCount = 0;

  const auditLoggingJobs = [];
  await DomainTransaction.execute(async () => {
    for (const userIdsBatch of userIdBatches) {
      const { garAnonymizedUserIds } = await authenticationMethodRepository.anonymizeByUserIds({
        userIds: userIdsBatch,
      });
      garAnonymizedUserCount += garAnonymizedUserIds.length;
      if (garAnonymizedUserIds?.length > 0) {
        auditLoggingJobs.push(
          AuditLoggingJob.forUsers({
            client: 'PIX_ADMIN',
            action: 'ANONYMIZATION_GAR',
            userIds: garAnonymizedUserIds,
            updatedByUserId: adminMemberId,
            role: PIX_ADMIN.ROLES.SUPER_ADMIN,
          }),
        );
      }
    }
  });
  for (const auditLoggingJob of auditLoggingJobs) {
    await auditLoggingJobRepository.performAsync(auditLoggingJob);
  }
  return { garAnonymizedUserCount, total: userIds.length };
};
