/**
 * @typedef {import('../../../shared/infrastructure/repositories/certification-assessment-repository.js')} CertificationAssessmentRepository
 * @typedef {import('../events/ChallengeDeneutralized.js').ChallengeDeneutralized} ChallengeDeneutralizedEvent
 */
import { ChallengeDeneutralized } from '../events/ChallengeDeneutralized.js';

/**
 * @param {object} params
 * @param {string} params.certificationCourseId
 * @param {string} params.challengeRecId
 * @param {string} params.juryId
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @returns {Promise<ChallengeDeneutralizedEvent>}
 */
export async function deneutralizeChallenge({
  certificationCourseId,
  challengeRecId,
  juryId,
  certificationAssessmentRepository,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  certificationAssessment.deneutralizeChallengeByRecId(challengeRecId);
  await certificationAssessmentRepository.save(certificationAssessment);
  return new ChallengeDeneutralized({ certificationCourseId, juryId });
}
