import adminMemberRepository from '../../infrastructure/repositories/admin-member-repository';

export default {
  async execute(userId) {
    const adminMember = await adminMemberRepository.get({ userId });
    return adminMember.isSuperAdmin;
  },
};
