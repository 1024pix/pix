const adminMemberRepository = require('../../infrastructure/repositories/admin-member-repository.js');

module.exports = {
  async execute(userId, dependencies = { adminMemberRepository }) {
    const adminMember = await dependencies.adminMemberRepository.get({ userId });
    return adminMember.isSuperAdmin;
  },
};
