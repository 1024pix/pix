const ResultCompetenceTree = require('../../models/ResultCompetenceTree');

module.exports = {
  decorateWithCleaStatusAndCompetenceTree: async function({
    certificationId,
    toBeDecorated,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  }) {
    const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationId);

    const competenceTree = await competenceTreeRepository.get();
    const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository });

    const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
      certificationId,
      assessmentResultId,
    });

    return {
      ...toBeDecorated,
      resultCompetenceTree,
      cleaCertificationStatus,
    };
  },

};

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository }) {
  const latestAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: certificationId });
  return [
    latestAssessmentResult.id,
    latestAssessmentResult.competenceMarks,
  ];
}
