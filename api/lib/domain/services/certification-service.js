const CertificationResult = require('../models/CertificationResult');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const certificationAssessmentRepository = require('../../../lib/infrastructure/repositories/certification-assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const cleaCertificationResultRepository = require('../../infrastructure/repositories/clea-certification-result-repository');
const pixPlusDroitMaitreCertificationResultRepository = require('../../infrastructure/repositories/pix-plus-droit-maitre-certification-result-repository');
const pixPlusDroitExpertCertificationResultRepository = require('../../infrastructure/repositories/pix-plus-droit-expert-certification-result-repository');
const certificationResultService = require('./certification-result-service');

async function calculateCertificationResultByCertificationCourseId(certificationCourseId) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({ certificationCourseId });
  return certificationResultService.getCertificationResult({ certificationAssessment, continueOnError: true });
}

async function getCertificationResultByCertifCourse({ certificationCourse }) {
  const certificationCourseId = certificationCourse.getId();
  const cleaCertificationResult = await cleaCertificationResultRepository.get({ certificationCourseId });
  const pixPlusDroitMaitreCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({ certificationCourseId });
  const pixPlusDroitExpertCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({ certificationCourseId });
  const lastAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId });
  const assessmentId = await assessmentRepository.getIdByCertificationCourseId(certificationCourseId);

  const certificationCourseDTO = certificationCourse.toDTO();
  return new CertificationResult({
    lastAssessmentResult,
    id: certificationCourse.getId(),
    assessmentId,
    firstName: certificationCourseDTO.firstName,
    lastName: certificationCourseDTO.lastName,
    birthdate: certificationCourseDTO.birthdate,
    birthplace: certificationCourseDTO.birthplace,
    externalId: certificationCourseDTO.externalId,
    completedAt: certificationCourseDTO.completedAt,
    createdAt: certificationCourseDTO.createdAt,
    isPublished: certificationCourseDTO.isPublished,
    isV2Certification: certificationCourseDTO.isV2Certification,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports: certificationCourseDTO.certificationIssueReports,
    hasSeenEndTestScreen: certificationCourseDTO.hasSeenEndTestScreen,
    sessionId: certificationCourseDTO.sessionId,
    isCourseCancelled: certificationCourseDTO.isCancelled,
  });
}

module.exports = {
  calculateCertificationResultByCertificationCourseId,
  getCertificationResultByCertifCourse,
};
