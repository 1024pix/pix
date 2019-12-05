const _ = require('lodash');
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

  async getCertificationResult(certificationCourseId) {
    const assessment = await assessmentRepository.getByCertificationCourseId(certificationCourseId);
    const certification = await certificationCourseRepository.get(certificationCourseId);

    let lastAssessmentResultFull = { competenceMarks: [], status: assessment ? assessment.state : 'missing-assessment' };

    const lastAssessmentResult = assessment && assessment.getLastAssessmentResult();
    if (lastAssessmentResult) {
      lastAssessmentResultFull = await assessmentResultRepository.get(lastAssessmentResult.id);
    }

    // TODO: Back this unnamed composite object with a real domain object
    // TODO: model and do the necessary adjustements in PixAdmin.
    return {
      ..._.pick(certification, ['id', 'createdAt', 'completedAt', 'firstName', 'lastName',
        'birthdate', 'birthplace', 'sessionId', 'externalId', 'isPublished', 'isV2Certification']),
      ..._.pick(lastAssessmentResultFull, ['level', 'emitter', 'commentForJury', 'commentForCandidate',
        'commentForOrganization', 'status', 'pixScore', 'juryId']),
      assessmentId: assessment ? assessment.id : null,
      resultCreatedAt: lastAssessmentResultFull.createdAt,
      competencesWithMark: lastAssessmentResultFull.competenceMarks,
    };
  },

  _computeAnswersSuccessRate,
};
