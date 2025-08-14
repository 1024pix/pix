import { refreshTokenRepository as injectedRefreshTokenRepository } from '../../../identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { adminMemberRepository as injectedAdminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';

const deactivateAdminMember = async function ({
  id,
  adminMemberRepository = injectedAdminMemberRepository,
  refreshTokenRepository = injectedRefreshTokenRepository,
} = {}) {
  const { userId } = await adminMemberRepository.getById(id);
  await adminMemberRepository.deactivate({ id });
  await refreshTokenRepository.revokeAllByUserId({ userId });
};

export { deactivateAdminMember };
