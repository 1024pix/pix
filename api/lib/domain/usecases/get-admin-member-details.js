const { ForbiddenAccess } = require('../errors');

module.exports = async function getAdminMemberDetails({ adminMemberRepository, userId }) {
  try {
    return await adminMemberRepository.get({ userId });
  } catch (e) {
    throw new ForbiddenAccess('Accès non autorisé');
  }
};
