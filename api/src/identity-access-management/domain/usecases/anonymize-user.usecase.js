import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UserNotFoundError } from '../../../shared/domain/errors.js';
import { adminMemberRepository as injectedAdminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as injectedPrivacyUsersApiRepository from '../../infrastructure/repositories/privacy-users-api.repository.js';

/**
 * @param params
 * @param{string} params.userId
 * @param{string} params.updatedByUserId
 * @param{AdminMemberRepository} params.adminMemberRepository
 * @returns {Promise<null>}
 */
const anonymizeUser = withTransaction(async function ({
  userId,
  updatedByUserId,
  adminMemberRepository = injectedAdminMemberRepository,
  privacyUsersApiRepository = injectedPrivacyUsersApiRepository,
} = {}) {
  const anonymizedBy = await _getAdminUser({
    adminUserId: updatedByUserId,
    adminMemberRepository,
  });

  const anonymizedByUserId = updatedByUserId;
  const anonymizedByUserRole = anonymizedBy.role;
  const client = 'PIX_ADMIN';

  await privacyUsersApiRepository.anonymizeUser({ userId, anonymizedByUserId, anonymizedByUserRole, client });
});

async function _getAdminUser({ adminUserId, adminMemberRepository }) {
  const admin = await adminMemberRepository.get({ userId: adminUserId });
  if (!admin) {
    throw new UserNotFoundError(`Admin not found for id: ${adminUserId}`);
  }
  return admin;
}

export { anonymizeUser };
