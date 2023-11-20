const getLearningContentByTargetProfile = async function ({
  targetProfileId,
  language,
  learningContentRepository,
  targetProfileForAdminRepository,
}) {
  const targetProfileForAdmin = await targetProfileForAdminRepository.get({ id: targetProfileId });
  const learningContent = await learningContentRepository.findByTargetProfileId(targetProfileId, language);
  return { learningContent, targetProfileName: targetProfileForAdmin.name };
};

export { getLearningContentByTargetProfile };
