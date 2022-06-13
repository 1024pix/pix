const adminMemberRepository = require('../../infrastructure/repositories/admin-member-repository');
const { ForbiddenAccess } = require('../../domain/errors');
const apps = require('../../domain/constants');

module.exports = {
  async execute(userId) {
    const adminMember = await adminMemberRepository.get({ userId });
    if (!adminMember) {
      throw new ForbiddenAccess(apps.PIX_ADMIN.NOT_ALLOWED_MSG);
    }
    return adminMember.isSupport;
  },
};
