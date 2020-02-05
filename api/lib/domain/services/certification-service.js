const CertificationResult = require('../models/CertificationResult');
const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const certificationResultService = require('./certification-result-service');

module.exports = {

  calculateCertificationResultByCertificationCourseId(certificationCourseId) {
    const continueOnError = true;
    return assessmentRepository
      .getByCertificationCourseId(certificationCourseId)
      .then((assessment) => certificationResultService.getCertificationResult(assessment, continueOnError));
  },

  calculateCertificationResultByAssessmentId(assessmentId) {
    const continueOnError = false;
    return assessmentRepository
      .get(assessmentId)
      .then((assessment) => certificationResultService.getCertificationResult(assessment, continueOnError));
  },

  async getCertificationResult(certificationCourseId) {
    const assessment = await assessmentRepository.getByCertificationCourseId(certificationCourseId);
    const certification = await certificationCourseRepository.get(certificationCourseId);

    let lastAssessmentResultFull = { competenceMarks: [], status: assessment ? assessment.state : 'missing-assessment' };

    const lastAssessmentResult = assessment && assessment.getLastAssessmentResult();
    if (lastAssessmentResult) {
      lastAssessmentResultFull = await assessmentResultRepository.get(lastAssessmentResult.id);
    }

    return new CertificationResult({
      id: certification.id,
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
      pixScore: lastAssessmentResultFull.pixScore,
      status: lastAssessmentResultFull.status,
      level: lastAssessmentResultFull.level,
      emitter: lastAssessmentResultFull.emitter,
      commentForCandidate: lastAssessmentResultFull.commentForCandidate,
      commentForJury: lastAssessmentResultFull.commentForJury,
      commentForOrganization: lastAssessmentResultFull.commentForOrganization,
      examinerComment: certification.examinerComment,
      hasSeenEndTestScreen: certification.hasSeenEndTestScreen,
      competencesWithMark: lastAssessmentResultFull.competenceMarks,
      assessmentId: assessment ? assessment.id : null,
      juryId: lastAssessmentResultFull.juryId,
      sessionId: certification.sessionId,
    });
  },
};
