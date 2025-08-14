import lodash from 'lodash';

const { has } = lodash;

import { AlreadyRegisteredEmailError } from '../../../../src/shared/domain/errors.js';
import {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredUsernameError,
} from '../../../../src/shared/domain/errors.js';
import { EventLoggingJob } from '../../../shared/domain/models/jobs/EventLoggingJob.js';
import { eventLoggingJobRepository as injectedEventLoggingJobRepository } from '../../../shared/infrastructure/repositories/jobs/event-logging-job.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';

const updateUserDetailsByAdmin = async function ({
  userId,
  userDetailsToUpdate,
  updatedByAdminId,
  userRepository = injectedUserRepository,
  eventLoggingJobRepository = injectedEventLoggingJobRepository,
} = {}) {
  const { email, username } = userDetailsToUpdate;

  await _checkEmailAndUsernameAreAvailable({ userId, email, username, userRepository });

  const currentUser = await userRepository.get(userId);

  const userMustValidateTermsOfService = _isAddingEmailForFirstTime({ currentUser, newEmail: email });
  if (userMustValidateTermsOfService) {
    userDetailsToUpdate.mustValidateTermsOfService = true;
  }

  await userRepository.updateUserDetailsForAdministration({ id: userId, userAttributes: userDetailsToUpdate });

  await _auditLogForEmailChanged({ currentUser, newEmail: email, updatedByAdminId, eventLoggingJobRepository });

  return userRepository.getUserDetailsForAdmin(userId);
};

async function _checkEmailAndUsernameAreAvailable({ userId, email, username, userRepository }) {
  const foundUsersWithEmailAlreadyUsed = email && (await userRepository.findAnotherUserByEmail(userId, email));
  const isEmailAlreadyUsed = has(foundUsersWithEmailAlreadyUsed, '[0].email');

  const foundUsersWithUsernameAlreadyUsed =
    username && (await userRepository.findAnotherUserByUsername(userId, username));
  const isUsernameAlreadyUsed = has(foundUsersWithUsernameAlreadyUsed, '[0].username');

  if (isEmailAlreadyUsed && isUsernameAlreadyUsed) {
    throw new AlreadyRegisteredEmailAndUsernameError();
  } else if (isEmailAlreadyUsed) {
    throw new AlreadyRegisteredEmailError();
  } else if (isUsernameAlreadyUsed) {
    throw new AlreadyRegisteredUsernameError();
  }
}

function _isAddingEmailForFirstTime({ currentUser, newEmail }) {
  const userWithoutEmail = !currentUser.email;
  const userHasUsername = !!currentUser.username;
  const shouldChangeEmail = !!newEmail;
  return userWithoutEmail && userHasUsername && shouldChangeEmail;
}

async function _auditLogForEmailChanged({ currentUser, newEmail, updatedByAdminId, eventLoggingJobRepository }) {
  if (!newEmail || newEmail === currentUser.email) return;

  // Currently only used in Pix Admin, which is why app name is hard-coded for the audit log
  await eventLoggingJobRepository.performAsync(
    EventLoggingJob.forUser({
      client: 'PIX_ADMIN',
      action: 'EMAIL_CHANGED',
      role: 'SUPPORT',
      userId: currentUser.id,
      updatedByUserId: updatedByAdminId,
      data: { oldEmail: currentUser.email, newEmail },
    }),
  );
}

export { updateUserDetailsByAdmin };
