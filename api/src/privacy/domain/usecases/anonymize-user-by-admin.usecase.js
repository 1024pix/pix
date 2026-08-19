import { EVENTS } from '../../../shared/constants.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.updatedByUserId
 * @returns {Promise<void>}
 */
export const anonymizeUserByAdmin = async function ({
  userId,
  updatedByUserId,
  adminMemberRepository,
  anonymizeServices,
  eventJobPublisherService,
  auditLoggingJobRepository,
}) {
  const anonymizedBy = await adminMemberRepository.get({
    userId: updatedByUserId,
  });
  if (!anonymizedBy) {
    throw new UserNotFoundError(`Admin not found for id: ${updatedByUserId}`);
  }

  await eventJobPublisherService.publishEvent(EVENTS.ANONYMIZE_USER_BY_ADMIN, {
    userId,
    updatedByUserId,
  });

  await anonymizeServices.anonymizeUser({
    userId,
    anonymizedByUserId: updatedByUserId,
  });

  await auditLoggingJobRepository.performAsync(
    AuditLoggingJob.forUser({
      client: 'PIX_ADMIN',
      action: 'ANONYMIZATION',
      userId,
      updatedByUserId: updatedByUserId,
      role: anonymizedBy.role,
    }),
  );
};
