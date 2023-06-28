import { NotFoundError } from '../../../src/shared/domain/errors.js';

const getAdminMemberDetails = async function ({ adminMemberRepository, userId }) {
  const adminMemberDetail = await adminMemberRepository.get({ userId });

  if (!adminMemberDetail) {
    throw new NotFoundError();
  }

  return adminMemberDetail;
};

export { getAdminMemberDetails };
