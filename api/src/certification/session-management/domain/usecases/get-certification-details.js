/**
 * @typedef {import('./index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import('./index.js').ScoringCertificationService} ScoringCertificationService
 */
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';
import { CertificationDetails } from '../read-models/CertificationDetails.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {CompetenceMarkRepository} params.competenceMarkRepository
 * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 * @param {PlacementProfileService} params.placementProfileService
 * @param {ScoringCertificationService} params.scoringCertificationService
 */
const getCertificationDetails = async function ({
  certificationCourseId,
  competenceMarkRepository,
  certificationAssessmentRepository,
  certificationCandidateRepository,
  placementProfileService,
  scoringCertificationService,
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
    version: CERTIFICATION_VERSIONS.V2,
    allowExcessPixAndLevels: false,
  });

  if (competenceMarks.length) {
    return _retrievePersistedCertificationDetails({
      competenceMarks,
      certificationAssessment,
      placementProfile,
    });
  } else {
    return _computeCertificationDetailsOnTheFly({
      certificationAssessment,
      placementProfile,
      scoringCertificationService,
    });
  }
};

export { getCertificationDetails };

async function _computeCertificationDetailsOnTheFly({
  certificationAssessment,
  placementProfile,
  scoringCertificationService,
}) {
  const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
    certificationAssessment,
    continueOnError: true,
  });
  return CertificationDetails.fromCertificationAssessmentScore({
    certificationAssessmentScore,
    certificationAssessment,
    placementProfile,
  });
}

/**
 * @param {PlacementProfileService} placementProfileService
 * @param {CertificationCandidateRepository} certificationCandidateRepository
 */
async function _retrievePersistedCertificationDetails({ competenceMarks, certificationAssessment, placementProfile }) {
  return CertificationDetails.from({
    competenceMarks,
    certificationAssessment,
    placementProfile,
  });
}
