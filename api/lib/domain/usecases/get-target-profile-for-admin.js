module.exports = async function getTargetProfileForAdmin({ targetProfileId, targetProfileForAdminRepository }) {
  return targetProfileForAdminRepository.get({ id: targetProfileId });
};
