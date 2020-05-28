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

module.exports = async function getUserCertificationWithResultTree({
  certificationId,
  userId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const certification = await certificationRepository.getByCertificationCourseId({ id: certificationId });
  const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationId);
  certification.cleaCertificationStatus = cleaCertificationStatus;
  if (certification.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const competenceTree = await competenceTreeRepository.get();
  const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, assessmentResultRepository });

  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
  });
  resultCompetenceTree.id = `${certificationId}-${assessmentResultId}`;

  certification.resultCompetenceTree = resultCompetenceTree;

  return certification;
};
