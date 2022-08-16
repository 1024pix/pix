module.exports = async function getTargetProfileForAdmin({ targetProfileId, targetProfileForAdminRepository }) {
  const isNewFormat = await targetProfileForAdminRepository.isNewFormat(targetProfileId);
  if (isNewFormat) return targetProfileForAdminRepository.getAsNewFormat({ id: targetProfileId });
  return targetProfileForAdminRepository.getAsOldFormat({ id: targetProfileId });
};
