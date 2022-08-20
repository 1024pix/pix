module.exports = async function getTargetProfileContentAsJson({ targetProfileId, targetProfileForAdminRepository }) {
  const targetProfileForAdmin = await targetProfileForAdminRepository.getAsNewFormat({ id: targetProfileId });
  const fileName = `profil_cible_${targetProfileForAdmin.name}.json`;
  const jsonContent = targetProfileForAdmin.getContentAsJson();
  return {
    jsonContent,
    fileName,
  };
};
