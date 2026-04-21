import lodash from 'lodash';

const { has } = lodash;

import { AlreadyRegisteredEmailError } from '../../../../src/shared/domain/errors.js';
import {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredUsernameError,
} from '../../../../src/shared/domain/errors.js';
import { AuditLoggingJob } from '../../../shared/domain/models/jobs/AuditLoggingJob.js';

/**
 * @param {Object} params
 * @param {string} params.userId - The ID of the user to update
 * @param {Object} params.userDetailsToUpdate - Object containing user details to update (email, username)
 * @param {string} params.updatedByAdminId - The ID of the admin user making the update
 * @param {UserRepository} params.userRepository
 * @param {AuditLoggingJobRepository} params.auditLoggingJobRepository
 * @returns {Promise<UserDetailsForAdmin>} Updated user details
 * @throws {AlreadyRegisteredEmailError} If email is already used by another user
 * @throws {AlreadyRegisteredUsernameError} If username is already used by another user
 * @throws {AlreadyRegisteredEmailAndUsernameError} If both email and username are already used
 */
const updateUserDetailsByAdmin = async function ({
  userId,
  userDetailsToUpdate,
  updatedByAdminId,
  userRepository,
  auditLoggingJobRepository,
}) {
  const { email, username } = userDetailsToUpdate;

  await _checkEmailAndUsernameAreAvailable({ userId, email, username, userRepository });

  const currentUser = await userRepository.get(userId);

  const userMustValidateTermsOfService = _isAddingEmailForFirstTime({ currentUser, newEmail: email });
  if (userMustValidateTermsOfService) {
    userDetailsToUpdate.mustValidateTermsOfService = true;
  }

  await userRepository.updateUserDetailsForAdministration({ id: userId, userAttributes: userDetailsToUpdate });

  await _auditLogForEmailChanged({ currentUser, newEmail: email, updatedByAdminId, auditLoggingJobRepository });

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

async function _auditLogForEmailChanged({ currentUser, newEmail, updatedByAdminId, auditLoggingJobRepository }) {
  if (!newEmail || newEmail === currentUser.email) return;

  // Currently only used in Pix Admin, which is why app name is hard-coded for the audit log
  await auditLoggingJobRepository.performAsync(
    AuditLoggingJob.forUser({
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
