const { NotFoundError } = require('../../domain/errors');
module.exports = async function getAdminMemberDetails({ adminMemberRepository, userId }) {
  const adminMemberDetail = await adminMemberRepository.get({ userId });
  if (!adminMemberDetail) {
    throw new NotFoundError();
  } else {
    return adminMemberDetail;
  }
};
