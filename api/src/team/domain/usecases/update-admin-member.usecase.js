import { adminMemberRepository as injectedAdminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
const updateAdminMember = async function ({ id, role, adminMemberRepository = injectedAdminMemberRepository } = {}) {
  const attributesToUpdate = { role };
  return await adminMemberRepository.update({ id, attributesToUpdate });
};

export { updateAdminMember };
