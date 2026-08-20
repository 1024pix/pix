import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';

function _toDomain({ assessmentResultDTO, competencesMarksDTO }) {
  const competenceMarks = competencesMarksDTO.map((competenceMark) => new CompetenceMark(competenceMark));
  // le taux de reproductibilité n'existe pas en V3 : la colonne y est NULL et doit le rester
  const reproducibilityRateAsNumber =
    assessmentResultDTO.reproducibilityRate == null ? null : Number(assessmentResultDTO.reproducibilityRate);
  const commentForOrganization = new JuryComment({
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    fallbackComment: assessmentResultDTO.commentForOrganization,
    context: JuryCommentContexts.ORGANIZATION,
  });
  const commentForCandidate = new JuryComment({
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    fallbackComment: assessmentResultDTO.commentForCandidate,
    context: JuryCommentContexts.CANDIDATE,
  });

  return new AssessmentResult({
    id: assessmentResultDTO.id,
    assessmentId: assessmentResultDTO.assessmentId,
    status: assessmentResultDTO.status,
    commentByJury: assessmentResultDTO.commentByJury,
    commentByAutoJury: assessmentResultDTO.commentByAutoJury,
    createdAt: assessmentResultDTO.createdAt,
    juryId: assessmentResultDTO.juryId,
    pixScore: assessmentResultDTO.pixScore,
    commentForCandidate,
    commentForOrganization,
    reproducibilityRate: reproducibilityRateAsNumber,
    competenceMarks: competenceMarks,
    capacity: assessmentResultDTO.capacity,
    reachedMeshIndex: assessmentResultDTO.reachedMeshIndex,
    versionId: assessmentResultDTO.versionId,
  });
}

const getLatestAssessmentResult = async function ({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();

  const latestAssessmentResultDTO = await knexConn('certification-courses-last-assessment-results')
    .select({
      id: 'assessment-results.id',
      assessmentId: 'assessment-results.assessmentId',
      status: 'assessment-results.status',
      commentByJury: 'assessment-results.commentByJury',
      commentByAutoJury: 'assessment-results.commentByAutoJury',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentForOrganization: 'assessment-results.commentForOrganization',
      createdAt: 'assessment-results.createdAt',
      juryId: 'assessment-results.juryId',
      pixScore: 'assessment-results.pixScore',
      reproducibilityRate: 'assessment-results.reproducibilityRate',
      capacity: 'assessment-results.capacity',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
      versionId: 'assessment-results.versionId',
      competenceMarkId: 'competence-marks.id',
      competenceMarkAreaCode: 'competence-marks.area_code',
      competenceMarkCompetenceCode: 'competence-marks.competence_code',
      competenceMarkCompetenceId: 'competence-marks.competenceId',
      competenceMarkLevel: 'competence-marks.level',
      competenceMarkScore: 'competence-marks.score',
      competenceMarkAssessmentResultId: 'competence-marks.assessmentResultId',
    })
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .where('certification-courses-last-assessment-results.certificationCourseId', certificationCourseId);

  if (latestAssessmentResultDTO.length === 0) {
    return null;
  }
  const competencesMarksDTO = [];
  for (const competenceMarkDTO of latestAssessmentResultDTO) {
    if (competenceMarkDTO.competenceMarkId) {
      competencesMarksDTO.push({
        id: competenceMarkDTO.competenceMarkId,
        area_code: competenceMarkDTO.competenceMarkAreaCode,
        competence_code: competenceMarkDTO.competenceMarkCompetenceCode,
        competenceId: competenceMarkDTO.competenceMarkCompetenceId,
        level: competenceMarkDTO.competenceMarkLevel,
        score: competenceMarkDTO.competenceMarkScore,
        assessmentResultId: competenceMarkDTO.competenceMarkAssessmentResultId,
      });
    }
  }

  return _toDomain({
    assessmentResultDTO: latestAssessmentResultDTO[0],
    competencesMarksDTO,
  });
};

export { getLatestAssessmentResult };
