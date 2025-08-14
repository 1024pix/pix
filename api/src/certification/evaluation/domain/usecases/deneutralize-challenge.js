import * as injectedCertificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import { ChallengeDeneutralized } from '../events/ChallengeDeneutralized.js';

const deneutralizeChallenge = async function ({
  certificationCourseId,
  challengeRecId,
  juryId,
  certificationAssessmentRepository = injectedCertificationAssessmentRepository,
} = {}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  certificationAssessment.deneutralizeChallengeByRecId(challengeRecId);
  await certificationAssessmentRepository.save(certificationAssessment);
  return new ChallengeDeneutralized({ certificationCourseId, juryId });
};

export { deneutralizeChallenge };
