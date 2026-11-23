import { UserAlreadyAnonymizedError, UserNotFoundError } from '../../../shared/domain/errors.js';
import { AnonymizeUserEvent } from '../../../shared/domain/events/AnonymizeUserEvent.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';

/**
 * @param params
 * @param {string} params.userId
 * @param {string} params.updatedByUserId
 * @param {boolean} params.force
 * @returns {Promise<void>}
 */
export const anonymizeUserByAdmin = async function ({
  userId,
  updatedByUserId,
  force,
  adminMemberRepository,
  userRepository,
  eventJobPublisherService,
  auditLoggingJobRepository,
}) {
  const anonymizedBy = await adminMemberRepository.get({
    userId: updatedByUserId,
  });
  if (!anonymizedBy) {
    throw new UserNotFoundError(`Admin not found for id: ${updatedByUserId}`);
  }

  const targetUser = await userRepository.get(userId);
  if (targetUser.hasBeenAnonymised && !force) {
    throw new UserAlreadyAnonymizedError();
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
