const { UserNotAuthorizedToAccessEntity } = require('../errors');
const ResultCompetenceTree = require('../models/ResultCompetenceTree');

function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, competenceMarkRepository }) {
  return assessmentRepository.getByCertificationCourseId(certificationId)
    .then((assessment) => {
      return assessment.getLastAssessmentResult().id;
    })
    .then((assessmentResultId) => {
      return Promise.all([
        assessmentResultId,
        competenceMarkRepository.findByAssessmentResultId(assessmentResultId),
      ]);
    });
}

module.exports = function getUserCertificationWithResultTree({
  certificationId,
  userId,
  certificationRepository,
  assessmentRepository,
  competenceMarkRepository,
  competenceTreeRepository,
}) {
  return certificationRepository.getByCertificationCourseId({ id: certificationId })
    .then((certification) => {
      if (certification.userId !== userId) {
        throw new UserNotAuthorizedToAccessEntity();
      }

      return certification;
    })
    .then((certification) => {

      return Promise.all([
        competenceTreeRepository.get(),
        _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, competenceMarkRepository }),
      ])
        .then(([competenceTree, [assessmentResultId, competenceMarks]]) => {

          const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
            competenceTree,
            competenceMarks,
          });
          resultCompetenceTree.id = `${certificationId}-${assessmentResultId}`;

          certification.resultCompetenceTree = resultCompetenceTree;

          return certification;
        });
    });
};
