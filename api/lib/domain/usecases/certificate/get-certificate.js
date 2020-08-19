const ResultCompetenceTree = require('../../models/ResultCompetenceTree');

module.exports = {
  getCertificate : async function getCertificate({
    certificate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  }) {
    const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificate.id);
    certificate.cleaCertificationStatus = cleaCertificationStatus;

    const competenceTree = await competenceTreeRepository.get();
    const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({ certificationId: certificate.id, assessmentResultRepository });

    const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
    });
    resultCompetenceTree.id = `${certificate.id}-${assessmentResultId}`;

    certificate.resultCompetenceTree = resultCompetenceTree;

    return certificate;
  }
};

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentResultRepository }) {
  const latestAssessmentResult = await assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks({ certificationCourseId: certificationId });
  return [
    latestAssessmentResult.id,
    latestAssessmentResult.competenceMarks,
  ];
}
