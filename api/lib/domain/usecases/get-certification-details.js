const CertificationDetails = require('../read-models/CertificationDetails');

module.exports = async function getCertificationDetails({
  certificationCourseId,
  competenceMarkRepository,
  certificationAssessmentRepository,
  placementProfileService,
}) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });

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
};
