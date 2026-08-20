import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';
import { createSelfDeleteUserAccountEmail } from '../emails/create-self-delete-user-account.email.js';
import { AnonymizeUserEvent } from '../events/AnonymizeUserEvent.js';

/**
 * @param{object} params
 * @param{number} params.userId
 * @returns {Promise<boolean>}
 */
export async function selfAnonymizeByUser({
  userId,
  locale,
  userRepository,
  emailRepository,
  anonymizeServices,
  eventJobPublisherService,
  auditLoggingJobRepository,
}) {
  const canAnonymize = await anonymizeServices.canSelfAnonymize({ userId });
  if (!canAnonymize) throw new ForbiddenAccess();

  // Keep a copy of email and firstName to send email to User after anonymization
  const { email, firstName } = await userRepository.get(userId);

  await eventJobPublisherService.publishEvent(new AnonymizeUserEvent({ userId, updatedByUserId: userId }));

  await auditLoggingJobRepository.performAsync(
    AuditLoggingJob.forUser({
      client: 'PIX_APP',
      action: 'ANONYMIZATION',
      userId,
      updatedByUserId: userId,
      role: 'USER',
    }),
  );

  if (email) {
    await emailRepository.sendEmailAsync(
      createSelfDeleteUserAccountEmail({
        locale: locale,
        email,
        firstName,
      }),
    );
  }
}
