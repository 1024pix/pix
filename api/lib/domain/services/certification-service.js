const CertificationResult = require('../models/CertificationResult');
const Assessment = require('../models/Assessment');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const certificationAssessmentRepository = require('../../../lib/infrastructure/repositories/certification-assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const cleaCertificationStatusRepository = require('../../infrastructure/repositories/clea-certification-status-repository');
const certificationResultService = require('./certification-result-service');

module.exports = {

  async calculateCertificationResultByCertificationCourseId(certificationCourseId) {
    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId(certificationCourseId);
    return certificationResultService.getCertificationResult({ certificationAssessment, continueOnError: true });
  },

  async getCertificationResult(certificationCourseId) {
    const certification = await certificationCourseRepository.get(certificationCourseId);
    const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationCourseId);
    const assessmentId = await assessmentRepository.getIdByCertificationCourseId(certificationCourseId);
    let lastAssessmentResultFull = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId });
    if (!lastAssessmentResultFull) {
      lastAssessmentResultFull = { competenceMarks: [], status: Assessment.states.STARTED };
    }

    return new CertificationResult({
      id: certification.id,
      assessmentId,
      firstName: certification.firstName,
      lastName: certification.lastName,
      birthdate: certification.birthdate,
      birthplace: certification.birthplace,
      externalId: certification.externalId,
      completedAt: certification.completedAt,
      createdAt: certification.createdAt,
      resultCreatedAt: lastAssessmentResultFull.createdAt,
      isPublished: certification.isPublished,
      isV2Certification: certification.isV2Certification,
      cleaCertificationStatus,
      pixScore: lastAssessmentResultFull.pixScore,
      status: lastAssessmentResultFull.status,
      emitter: lastAssessmentResultFull.emitter,
      commentForCandidate: lastAssessmentResultFull.commentForCandidate,
      commentForJury: lastAssessmentResultFull.commentForJury,
      commentForOrganization: lastAssessmentResultFull.commentForOrganization,
      examinerComment: certification.examinerComment,
      hasSeenEndTestScreen: certification.hasSeenEndTestScreen,
      competencesWithMark: lastAssessmentResultFull.competenceMarks,
      juryId: lastAssessmentResultFull.juryId,
      sessionId: certification.sessionId,
    });
  },
};
