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
  const certificationCourseId = certificationCourse.id;
  const cleaCertificationResult = await cleaCertificationResultRepository.get({ certificationCourseId });
  const pixPlusDroitMaitreCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({ certificationCourseId });
  const pixPlusDroitExpertCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({ certificationCourseId });
  const lastAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId });
  const assessmentId = await assessmentRepository.getIdByCertificationCourseId(certificationCourseId);

  return new CertificationResult({
    lastAssessmentResult,
    id: certificationCourse.id,
    assessmentId,
    firstName: certificationCourse.firstName,
    lastName: certificationCourse.lastName,
    birthdate: certificationCourse.birthdate,
    birthplace: certificationCourse.birthplace,
    externalId: certificationCourse.externalId,
    completedAt: certificationCourse.completedAt,
    createdAt: certificationCourse.createdAt,
    isPublished: certificationCourse.isPublished,
    isV2Certification: certificationCourse.isV2Certification,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports: certificationCourse.certificationIssueReports,
    hasSeenEndTestScreen: certificationCourse.hasSeenEndTestScreen,
    sessionId: certificationCourse.sessionId,
  });
}

module.exports = {
  calculateCertificationResultByCertificationCourseId,
  getCertificationResultByCertifCourse,
};
