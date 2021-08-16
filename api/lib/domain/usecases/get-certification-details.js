const CertificationDetails = require('../read-models/CertificationDetails');

module.exports = async function getCertificationDetails({
  certificationCourseId,
  competenceMarkRepository,
  certificationAssessmentRepository,
  placementProfileService,
  certificationResultService,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });
  if (certificationAssessment.isCompleted()) {
    return _retrievePersistedCertificationDetails(
      certificationCourseId,
      certificationAssessment,
      competenceMarkRepository,
      placementProfileService,
    );
  } else {
    return _computeCertificationDetailsOnTheFly(
      certificationCourseId,
      certificationAssessment,
      placementProfileService,
      certificationResultService,
    );
  }
};

async function _computeCertificationDetailsOnTheFly(certificationCourseId, certificationAssessment, placementProfileService, certificationResultService) {
  const certificationAssessmentScore = await certificationResultService.computeResult({
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

async function _retrievePersistedCertificationDetails(certificationCourseId, certificationAssessment, competenceMarkRepository, placementProfileService) {
  const competenceMarks = await competenceMarkRepository.findByCertificationCourseId(certificationCourseId);

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
