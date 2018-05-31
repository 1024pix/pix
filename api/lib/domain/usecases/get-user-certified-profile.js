const { UserNotAuthorizedToAccessEntity } = require('../errors');
const CertifiedProfile = require('../models/CertifiedProfile');

module.exports = function({ certificationId, userId, assessmentRepository, competenceMarksRepository, competenceRepository }) {
  let competencesEvaluated;
  return assessmentRepository.getByCertificationCourseId(certificationId)
    .then((assessment) => {
      if (assessment.userId !== parseInt(userId, 10)) {
        throw new UserNotAuthorizedToAccessEntity();
      }
      return assessment.getLastAssessmentResult().id;
    })
    .then(assessmentResultId => {
      return competenceMarksRepository.findByAssessmentResultId(assessmentResultId);
    })
    .then(competenceEvaluatedFind => {
      competencesEvaluated = competenceEvaluatedFind;
      return competenceRepository.list();
    })
    .then(allCompetences => {
      return new CertifiedProfile({ allCompetences, competencesEvaluated });
    });
};
