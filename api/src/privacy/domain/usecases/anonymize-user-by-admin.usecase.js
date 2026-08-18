import { UserNotFoundError } from '../../../shared/domain/errors.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';
import { AnonymizeUserEvent } from '../events/AnonymizeUserEvent.js';

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
  eventJobPublisherService,
  auditLoggingJobRepository,
}) {
  const anonymizedBy = await adminMemberRepository.get({
    userId: updatedByUserId,
  });
  if (!anonymizedBy) {
    throw new UserNotFoundError(`Admin not found for id: ${updatedByUserId}`);
  }

  await eventJobPublisherService.publishEvent(new AnonymizeUserEvent({ userId, updatedByUserId }));

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
