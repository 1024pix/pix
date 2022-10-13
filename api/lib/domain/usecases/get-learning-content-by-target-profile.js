module.exports = async function getLearningContentByTargetProfile({
  targetProfileId,
  language,
  learningContentRepository,
}) {
  return learningContentRepository.findByTargetProfileId(targetProfileId, language);
};
