const getLearningContentByTargetProfile = async function ({
  targetProfileId,
  language,
  learningContentRepository,
  targetProfileAdministrationRepository,
}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id: targetProfileId });
  const learningContent = await learningContentRepository.findByTargetProfileId(targetProfileId, language);
  return { learningContent, targetProfileName: targetProfileForAdmin.name };
};

export { getLearningContentByTargetProfile };
