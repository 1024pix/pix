const ResultCompetenceTree = require('../models/ResultCompetenceTree');

module.exports = {
  computeForCertification: async ({
    certificationId,
    assessmentResultRepository,
    competenceTreeRepository,
  }) => {
    const competenceTree = await competenceTreeRepository.get();
    const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({
      certificationId,
      assessmentResultRepository,
    });

    return ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
      certificationId,
      assessmentResultId,
    });
  },
};

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository }) {
  const latestAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: certificationId });
  return [
    latestAssessmentResult.id,
    latestAssessmentResult.competenceMarks,
  ];
}
