import {
  EmailModificationDemandNotFoundOrExpiredError,
  InvalidVerificationCodeError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../shared/domain/errors.js';
import { EventLoggingJob } from '../models/jobs/EventLoggingJob.js';

const updateUserEmailWithValidation = async function ({
  code,
  userId,
  userEmailRepository,
  userRepository,
  eventLoggingJobRepository,
}) {
  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  const emailModificationDemand = await userEmailRepository.getEmailModificationDemandByUserId(userId);
  if (!emailModificationDemand) {
    throw new EmailModificationDemandNotFoundOrExpiredError();
  }

  if (code !== emailModificationDemand.code) {
    throw new InvalidVerificationCodeError();
  }

  await userRepository.checkIfEmailIsAvailable(emailModificationDemand.newEmail);

  await userRepository.updateWithEmailConfirmed({
    id: userId,
    userAttributes: {
      email: emailModificationDemand.newEmail,
      emailConfirmedAt: new Date(),
    },
  });

  // Currently only used in Pix App, which is why app name is hard-coded for the audit log.
  await eventLoggingJobRepository.performAsync(
    new EventLoggingJob({
      client: 'PIX_APP',
      action: 'EMAIL_CHANGED',
      role: 'USER',
      userId: user.id,
      targetUserId: user.id,
      data: { oldEmail: user.email, newEmail: emailModificationDemand.newEmail },
    }),
  );

  return { email: emailModificationDemand.newEmail };
};

export { updateUserEmailWithValidation };
