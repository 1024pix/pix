import CertifiableProfileForLearningContent from '../../../../lib/domain/models/CertifiableProfileForLearningContent';

const buildCertifiableProfileForLearningContent = function ({
  learningContent,
  knowledgeElements,
  answerAndChallengeIdsByAnswerId,
} = {}) {
  return new CertifiableProfileForLearningContent({
    learningContent,
    knowledgeElements,
    answerAndChallengeIdsByAnswerId,
  });
};

export default buildCertifiableProfileForLearningContent;
