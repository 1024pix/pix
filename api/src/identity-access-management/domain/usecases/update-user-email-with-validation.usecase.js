import {
  EmailModificationDemandNotFoundOrExpiredError,
  InvalidVerificationCodeError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../shared/domain/errors.js';
import { EventLoggingJob } from '../../../shared/domain/models/jobs/EventLoggingJob.js';
import { eventLoggingJobRepository as injectedEventLoggingJobRepository } from '../../../shared/infrastructure/repositories/jobs/event-logging-job.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { userEmailRepository as injectedUserEmailRepository } from '../../infrastructure/repositories/user-email.repository.js';

const updateUserEmailWithValidation = async function ({
  code,
  userId,
  userEmailRepository = injectedUserEmailRepository,
  userRepository = injectedUserRepository,
  eventLoggingJobRepository = injectedEventLoggingJobRepository,
} = {}) {
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
    EventLoggingJob.forUser({
      client: 'PIX_APP',
      action: 'EMAIL_CHANGED',
      role: 'USER',
      userId: user.id,
      updatedByUserId: user.id,
      data: { oldEmail: user.email, newEmail: emailModificationDemand.newEmail },
    }),
  );

  return { email: emailModificationDemand.newEmail };
};

export { updateUserEmailWithValidation };
