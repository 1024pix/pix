import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';
import { createSelfDeleteUserAccountEmail } from '../emails/create-self-delete-user-account.email.js';

/**
 * @param{object} params
 * @param{number} params.userId
 * @returns {Promise<boolean>}
 */
export const selfAnonymizeByUser = async function ({
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

  const user = await userRepository.get(userId);

  const anonymizedByUserId = userId;
  const anonymizedByUserRole = 'USER';
  const client = 'PIX_APP';

  await anonymizeServices.anonymizeUser({ userId, anonymizedByUserId, anonymizedByUserRole, client });

  if (user.email) {
    await emailRepository.sendEmailAsync(
      createSelfDeleteUserAccountEmail({
        locale: locale,
        email: user.email,
        firstName: user.firstName,
      }),
    );
  }
};
