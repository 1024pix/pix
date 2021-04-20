const ResultCompetenceTree = require('../../models/ResultCompetenceTree');

module.exports = {
  decorateWithCleaStatusAndCompetenceTree: async function({
    certificationId,
    toBeDecorated,
    cleaCertificationResultRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  }) {
    const cleaCertificationResult = await cleaCertificationResultRepository.get(certificationId);

    const competenceTree = await competenceTreeRepository.get();
    const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository });

    const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
    });
    resultCompetenceTree.id = `${certificationId}-${assessmentResultId}`;
    toBeDecorated.resultCompetenceTree = resultCompetenceTree;
    toBeDecorated.cleaCertificationResult = cleaCertificationResult;

    return toBeDecorated;
  },

};

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository }) {
  const latestAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: certificationId });
  return [
    latestAssessmentResult.id,
    latestAssessmentResult.competenceMarks,
  ];
}
