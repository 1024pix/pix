const { NotFoundError } = require('../errors');

module.exports = async function getAdminMemberDetails({ adminMemberRepository, userId }) {
  const adminMemberDetail = await adminMemberRepository.get({ userId });

  if (!adminMemberDetail) {
    throw new NotFoundError();
  }

  return adminMemberDetail;
};
