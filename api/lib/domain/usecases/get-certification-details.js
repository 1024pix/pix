const CertificationDetails = require('../read-models/CertificationDetails.js');

module.exports = async function getCertificationDetails({
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
      scoringCertificationService
    );
  }
};

async function _computeCertificationDetailsOnTheFly(
  certificationAssessment,
  placementProfileService,
  scoringCertificationService
) {
  const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
    certificationAssessment,
    continueOnError: true,
  });
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    isV2Certification: certificationAssessment.isV2Certification,
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
  placementProfileService
) {
  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    isV2Certification: certificationAssessment.isV2Certification,
  });

  return CertificationDetails.from({
    competenceMarks,
    certificationAssessment,
    placementProfile,
  });
}
