const { UserNotAuthorizedToAccessEntity } = require('../errors');
const ResultCompetenceTree = require('../models/ResultCompetenceTree');

async function _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, competenceMarkRepository }) {
  const assessment = await assessmentRepository.getByCertificationCourseId(certificationId);
  const assessmentResultId = assessment.getLastAssessmentResult().id;
  const competenceMarks = await competenceMarkRepository.findByAssessmentResultId(assessmentResultId);

  return [
    assessmentResultId,
    competenceMarks
  ];
}

module.exports = async function getUserCertificationWithResultTree({
  certificationId,
  userId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentRepository,
  competenceMarkRepository,
  competenceTreeRepository,
}) {
  const certification = await certificationRepository.getByCertificationCourseId({ id: certificationId });
  const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationId);
  certification.cleaCertificationStatus = cleaCertificationStatus;
  if (certification.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const competenceTree = await competenceTreeRepository.get();
  const [assessmentResultId, competenceMarks] = await _getsCompetenceMarksAndAssessmentResultId({ certificationId, assessmentRepository, competenceMarkRepository });

  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
  });
  resultCompetenceTree.id = `${certificationId}-${assessmentResultId}`;

  certification.resultCompetenceTree = resultCompetenceTree;

  return certification;
};
