import * as adminMemberRepository from '../../../src/shared/infrastructure/repositories/admin-member-repository.js';

const execute = async function (userId, dependencies = { adminMemberRepository }) {
  const adminMember = await dependencies.adminMemberRepository.get({ userId });
  return adminMember.isSuperAdmin;
};

export { execute };
