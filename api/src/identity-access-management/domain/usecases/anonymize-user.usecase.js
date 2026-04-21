import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {string} params.userId - The ID of the user to anonymize
 * @param {string} params.updatedByUserId - The ID of the admin user performing the anonymization
 * @param {AdminMemberRepository} params.adminMemberRepository
 * @param {PrivacyUsersApiRepository} params.privacyUsersApiRepository
 * @returns {Promise<void>}
 */
const anonymizeUser = withTransaction(async function ({
  userId,
  updatedByUserId,
  adminMemberRepository,
  privacyUsersApiRepository,
}) {
  const anonymizedBy = await _getAdminUser({
    adminUserId: updatedByUserId,
    adminMemberRepository,
  });

  const anonymizedByUserId = updatedByUserId;
  const anonymizedByUserRole = anonymizedBy.role;
  const client = 'PIX_ADMIN';

  await privacyUsersApiRepository.anonymizeUser({ userId, anonymizedByUserId, anonymizedByUserRole, client });
});

/**
 * @param {Object} params
 * @param {string} params.adminUserId
 * @param {AdminMemberRepository} params.adminMemberRepository
 * @returns {Promise<AdminMember>}
 * @private
 */
async function _getAdminUser({ adminUserId, adminMemberRepository }) {
  const admin = await adminMemberRepository.get({ userId: adminUserId });
  if (!admin) {
    throw new UserNotFoundError(`Admin not found for id: ${adminUserId}`);
  }
  return admin;
}

export { anonymizeUser };
