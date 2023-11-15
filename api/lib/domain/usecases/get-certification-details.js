import { CertificationDetails } from '../read-models/CertificationDetails.js';
import { CertificationVersion } from '../../../src/shared/domain/models/CertificationVersion.js';

const getCertificationDetails = async function ({
  certificationCourseId,
  competenceMarkRepository,
  certificationAssessmentRepository,
  placementProfileService,
  scoringCertificationService,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });

  const competenceMarks = await competenceMarkRepository.findByCertificationCourseId(certificationCourseId);

  if (competenceMarks.length) {
    return _retrievePersistedCertificationDetails(competenceMarks, certificationAssessment, placementProfileService);
  } else {
    return _computeCertificationDetailsOnTheFly(
      certificationAssessment,
      placementProfileService,
      scoringCertificationService,
    );
  }
};

export { getCertificationDetails };

async function _computeCertificationDetailsOnTheFly(
  certificationAssessment,
  placementProfileService,
  scoringCertificationService,
) {
  const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
    certificationAssessment,
    continueOnError: true,
  });
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    version: CertificationVersion.V2,
    allowExcessPixAndLevels: false,
  });

  return CertificationDetails.fromCertificationAssessmentScore({
    certificationAssessmentScore,
    certificationAssessment,
    placementProfile,
  });
}

async function _retrievePersistedCertificationDetails(
  competenceMarks,
  certificationAssessment,
  placementProfileService,
) {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    version: CertificationVersion.V2,
    allowExcessPixAndLevels: false,
  });

  return CertificationDetails.from({
    competenceMarks,
    certificationAssessment,
    placementProfile,
  });
}
