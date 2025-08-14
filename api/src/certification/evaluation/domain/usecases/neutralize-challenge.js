import * as injectedCertificationAssessmentRepository from '../../../shared/infrastructure/repositories/certification-assessment-repository.js';
import { ChallengeNeutralized } from '../events/ChallengeNeutralized.js';

const neutralizeChallenge = async function ({
  certificationCourseId,
  challengeRecId,
  juryId,
  certificationAssessmentRepository = injectedCertificationAssessmentRepository,
} = {}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  certificationAssessment.neutralizeChallengeByRecId(challengeRecId);
  await certificationAssessmentRepository.save(certificationAssessment);
  return new ChallengeNeutralized({ certificationCourseId, juryId });
};

export { neutralizeChallenge };
