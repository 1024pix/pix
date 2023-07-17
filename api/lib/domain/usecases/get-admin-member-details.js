import { ForbiddenAccess } from '../errors.js';

const getAdminMemberDetails = async function ({ adminMemberRepository, userId }) {
  const adminMemberDetail = await adminMemberRepository.get({ userId });

  if (!adminMemberDetail) {
    throw new ForbiddenAccess();
  }

  return adminMemberDetail;
};

export { getAdminMemberDetails };
