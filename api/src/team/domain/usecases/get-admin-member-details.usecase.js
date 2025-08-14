import { adminMemberRepository as injectedAdminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js'; /**
 * @typedef {import ('./index.js').AdminMemberRepository} AdminMemberRepository
 */

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {AdminMemberRepository} params.adminMemberRepository
 */
const getAdminMemberDetails = async function ({ userId, adminMemberRepository = injectedAdminMemberRepository } = {}) {
  return await adminMemberRepository.get({ userId });
};

export { getAdminMemberDetails };
