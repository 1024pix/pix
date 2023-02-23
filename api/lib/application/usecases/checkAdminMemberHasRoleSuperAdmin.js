const adminMemberRepository = require('../../infrastructure/repositories/admin-member-repository.js');

module.exports = {
  async execute(userId) {
    const adminMember = await adminMemberRepository.get({ userId });
    return adminMember.isSuperAdmin;
  },
};
