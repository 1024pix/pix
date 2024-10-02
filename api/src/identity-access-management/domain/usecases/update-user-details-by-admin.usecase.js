import lodash from 'lodash';

const { has } = lodash;

import { AlreadyRegisteredEmailError } from '../../../../src/shared/domain/errors.js';
import {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredUsernameError,
} from '../../../../src/shared/domain/errors.js';
import { EventLoggingJob } from '../models/jobs/EventLoggingJob.js';

const updateUserDetailsByAdmin = async function ({
  userId,
  userDetailsToUpdate,
  updatedByAdminId,
  userRepository,
  eventLoggingJobRepository,
}) {
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
    new EventLoggingJob({
      client: 'PIX_ADMIN',
      action: 'EMAIL_CHANGED',
      role: 'SUPPORT',
      userId: updatedByAdminId,
      targetUserId: currentUser.id,
      data: { oldEmail: currentUser.email, newEmail },
    }),
  );
}

export { updateUserDetailsByAdmin };
