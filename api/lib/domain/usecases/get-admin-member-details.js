import { ForbiddenAccess } from '../../../src/shared/domain/errors.js';

const getAdminMemberDetails = async function ({ adminMemberRepository, userId }) {
  const adminMemberDetail = await adminMemberRepository.get({ userId });

  if (!adminMemberDetail) {
    throw new ForbiddenAccess();
  }

  return adminMemberDetail;
};

export { getAdminMemberDetails };
