const { UserNotAuthorizedToAccessEntity } = require('../errors');
const ResultCompetenceTree = require('../models/ResultCompetenceTree');

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, assessmentResultRepository }) {
  const assessment = await assessmentRepository.getByCertificationCourseId(certificationId);
  const latestAssessmentResult = await assessmentResultRepository.findLatestByAssessmentId(assessment.id);
  return [
    latestAssessmentResult.id,
    latestAssessmentResult.competenceMarks,
  ];
}

module.exports = function getUserCertificationWithResultTree({
  certificationId,
  userId,
  certificationRepository,
  assessmentRepository,
  assessmentResultRepository,
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
        _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, assessmentResultRepository }),
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
