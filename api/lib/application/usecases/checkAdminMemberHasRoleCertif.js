const adminMemberRepository = require('../../infrastructure/repositories/admin-member-repository');

module.exports = {
  async execute(userId) {
    const adminMember = await adminMemberRepository.get({ userId });
    return adminMember.isCertif;
  },
};
