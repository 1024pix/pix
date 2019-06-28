const assessmentRepository = require('../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const certificationResultService = require('./certification-result-service');

function _computeAnswersSuccessRate(answers = []) {
  const numberOfAnswers = answers.length;

  if (!numberOfAnswers) {
    return 0;
  }

  const numberOfValidAnswers = answers.filter((answer) => answer.isOk()).length;

  return (numberOfValidAnswers % 100 / numberOfAnswers) * 100;
}

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

  getCertificationResult(certificationCourseId) {
    let assessment = {};
    let certification = {};
    return assessmentRepository
      .getByCertificationCourseId(certificationCourseId)
      .then((foundAssessment) => {
        assessment = foundAssessment;
        return certificationCourseRepository.get(certificationCourseId);
      })
      .then((foundCertification) => {
        certification = foundCertification;

        if (assessment) {
          const lastAssessmentResult = assessment.getLastAssessmentResult();

          if (lastAssessmentResult) {
            return assessmentResultRepository.get(lastAssessmentResult.id);
          }
        }

        return { competenceMarks: [], status: assessment ? assessment.state : 'missing-assessment' };
      })
      .then((lastAssessmentResultFull) => {
        return {
          level: lastAssessmentResultFull.level,
          certificationId: certification.id,
          assessmentId: assessment ? assessment.id : null,
          emitter: lastAssessmentResultFull.emitter,
          commentForJury: lastAssessmentResultFull.commentForJury,
          commentForCandidate: lastAssessmentResultFull.commentForCandidate,
          commentForOrganization: lastAssessmentResultFull.commentForOrganization,
          status: lastAssessmentResultFull.status,
          pixScore: lastAssessmentResultFull.pixScore,
          createdAt: certification.createdAt,
          juryId: lastAssessmentResultFull.juryId,
          resultCreatedAt: lastAssessmentResultFull.createdAt,
          completedAt: certification.completedAt,
          competencesWithMark: lastAssessmentResultFull.competenceMarks,
          firstName: certification.firstName,
          lastName: certification.lastName,
          birthdate: certification.birthdate,
          birthplace: certification.birthplace,
          sessionId: certification.sessionId,
          externalId: certification.externalId,
          isPublished: certification.isPublished,
          isV2Certification: certification.isV2Certification,
        };
      });
  },

  _computeAnswersSuccessRate,
};
