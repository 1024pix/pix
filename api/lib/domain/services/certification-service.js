const CertificationResult = require('../models/CertificationResult');
const Assessment = require('../models/Assessment');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const certificationAssessmentRepository = require('../../../lib/infrastructure/repositories/certification-assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const cleaCertificationStatusRepository = require('../../infrastructure/repositories/clea-certification-status-repository');
const certificationResultService = require('./certification-result-service');

async function calculateCertificationResultByCertificationCourseId(certificationCourseId) {
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId(certificationCourseId);
  return certificationResultService.getCertificationResult({ certificationAssessment, continueOnError: true });
}

async function getCertificationResult(certificationCourseId) {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);
  return getCertificationResultByCertifCourse({ certificationCourse });
}

async function getCertificationResultByCertifCourse({ certificationCourse }) {
  const certificationCourseId = certificationCourse.id;
  const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationCourseId);
  let lastAssessmentResultFull = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId });
  const assessmentId = await assessmentRepository.getIdByCertificationCourseId(certificationCourseId);
  if (!lastAssessmentResultFull) {
    lastAssessmentResultFull = { competenceMarks: [], status: Assessment.states.STARTED };
  }

  return new CertificationResult({
    id: certificationCourse.id,
    assessmentId,
    firstName: certificationCourse.firstName,
    lastName: certificationCourse.lastName,
    birthdate: certificationCourse.birthdate,
    birthplace: certificationCourse.birthplace,
    externalId: certificationCourse.externalId,
    completedAt: certificationCourse.completedAt,
    createdAt: certificationCourse.createdAt,
    resultCreatedAt: lastAssessmentResultFull.createdAt,
    isPublished: certificationCourse.isPublished,
    isV2Certification: certificationCourse.isV2Certification,
    cleaCertificationStatus,
    pixScore: lastAssessmentResultFull.pixScore,
    status: lastAssessmentResultFull.status,
    emitter: lastAssessmentResultFull.emitter,
    commentForCandidate: lastAssessmentResultFull.commentForCandidate,
    commentForJury: lastAssessmentResultFull.commentForJury,
    commentForOrganization: lastAssessmentResultFull.commentForOrganization,
    examinerComment: certificationCourse.examinerComment,
    hasSeenEndTestScreen: certificationCourse.hasSeenEndTestScreen,
    competencesWithMark: lastAssessmentResultFull.competenceMarks,
    juryId: lastAssessmentResultFull.juryId,
    sessionId: certificationCourse.sessionId,
  });
}

module.exports = {
  calculateCertificationResultByCertificationCourseId,
  getCertificationResult,
  getCertificationResultByCertifCourse,
};
