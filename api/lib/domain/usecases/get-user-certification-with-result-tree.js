const { UserNotAuthorizedToAccessEntity } = require('../errors');
const ResultCompetenceTree = require('../models/ResultCompetenceTree');

function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, competenceMarksRepository }) {
  return assessmentRepository.getByCertificationCourseId(certificationId)
    .then((assessment) => {
      return assessment.getLastAssessmentResult().id;
    })
    .then((assessmentResultId) => {
      return Promise.all([
        assessmentResultId,
        competenceMarksRepository.findByAssessmentResultId(assessmentResultId),
      ]);
    });
}

module.exports = function({
  certificationId,
  userId,
  certificationRepository,
  assessmentRepository,
  competenceMarksRepository,
  competenceTreeRepository,
}) {
  return certificationRepository.getCertification({ id: certificationId })
    .then((certification) => {
      if (certification.userId !== parseInt(userId, 10)) {
        throw new UserNotAuthorizedToAccessEntity();
      }

      return certification;
    })
    .then((certification) => {

      return Promise.all([
        competenceTreeRepository.get(),
        _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, competenceMarksRepository }),
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
