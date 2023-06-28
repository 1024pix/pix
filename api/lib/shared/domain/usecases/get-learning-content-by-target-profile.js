const getLearningContentByTargetProfile = async function ({ targetProfileId, language, learningContentRepository }) {
  return learningContentRepository.findByTargetProfileId(targetProfileId, language);
};

export { getLearningContentByTargetProfile };
