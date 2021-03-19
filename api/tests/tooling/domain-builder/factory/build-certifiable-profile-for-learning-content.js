const CertifiableProfileForLearningContent = require('../../../../lib/domain/models/CertifiableProfileForLearningContent');

const buildCertifiableProfileForLearningContent = function buildCertifiableProfileForLearningContent({
  targetProfileWithLearningContent,
  knowledgeElements,
  answerAndChallengeIdsByAnswerId,
} = {}) {
  return new CertifiableProfileForLearningContent({
    targetProfileWithLearningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  });
};

module.exports = buildCertifiableProfileForLearningContent;
