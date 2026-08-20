/**
 * @typedef {import('./index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').PlacementProfileService} PlacementProfileService
 */
import { CertificationDetails } from '../read-models/CertificationDetails.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 * @param {PlacementProfileService} params.placementProfileService
 */
export async function getCertificationDetails({
  certificationCourseId,
  competenceMarkRepository,
  certificationAssessmentRepository,
  certificationCandidateRepository,
  placementProfileService,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });

  const competenceMarks = await competenceMarkRepository.findByCertificationCourseId({ certificationCourseId });
  const candidate = await certificationCandidateRepository.getByCertificationCourseId({
    certificationCourseId: certificationAssessment.certificationCourseId,
  });

  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: candidate.userId,
    limitDate: candidate.reconciledAt,
    allowExcessPixAndLevels: false,
  });

  return CertificationDetails.from({
    competenceMarks,
    certificationAssessment,
    placementProfile,
  });
}
