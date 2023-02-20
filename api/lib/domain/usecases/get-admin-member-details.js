import { NotFoundError } from '../errors';

export default async function getAdminMemberDetails({ adminMemberRepository, userId }) {
  const adminMemberDetail = await adminMemberRepository.get({ userId });

  if (!adminMemberDetail) {
    throw new NotFoundError();
  }

  return adminMemberDetail;
}
