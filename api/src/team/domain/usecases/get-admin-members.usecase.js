import { adminMemberRepository as injectedAdminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
const getAdminMembers = async function ({ adminMemberRepository = injectedAdminMemberRepository } = {}) {
  return adminMemberRepository.findAll();
};

export { getAdminMembers };
