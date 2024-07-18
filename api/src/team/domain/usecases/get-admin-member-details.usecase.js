/**
 * @typedef {import ('./index.js').AdminMemberRepository} AdminMemberRepository
 */

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {AdminMemberRepository} params.adminMemberRepository
 */
const getAdminMemberDetails = async function ({ userId, adminMemberRepository }) {
  return await adminMemberRepository.get({ userId });
};

export { getAdminMemberDetails };
