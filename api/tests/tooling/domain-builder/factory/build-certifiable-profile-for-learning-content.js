const CertifiableProfileForLearningContent = require('../../../../lib/domain/models/CertifiableProfileForLearningContent');

const buildCertifiableProfileForLearningContent = function buildCertifiableProfileForLearningContent({
  userId,
  profileDate,
  targetProfileWithLearningContent,
  knowledgeElements,
  answerAndChallengeIdsByAnswerId,
} = {}) {
  return new CertifiableProfileForLearningContent({
    userId,
    profileDate,
    targetProfileWithLearningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  });
};

module.exports = buildCertifiableProfileForLearningContent;
