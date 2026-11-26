import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationResult } from '../../domain/models/NewCertificationResult.ts';

export async function save({ certificationResults, userCertificationResults }) {
  const knexConn = DomainTransaction.getConnection();
  const { certificationResultsData, certificationCompetenceResultsData, userCertificationResultsData } = toDB({
    certificationResults,
    userCertificationResults,
  });
  if (certificationResultsData.length > 0) {
    await knexConn
      .batchInsert('certification_results', certificationResultsData)
      .transacting(knexConn.isTransaction ? knexConn : null);
  }
  if (certificationCompetenceResultsData.length > 0) {
    await knexConn
      .batchInsert('certification_competence_results', certificationCompetenceResultsData)
      .transacting(knexConn.isTransaction ? knexConn : null);
  }
  if (userCertificationResultsData.length > 0) {
    await knexConn
      .batchInsert('user_certification_results', userCertificationResultsData)
      .transacting(knexConn.isTransaction ? knexConn : null);
  }
}

export async function getByCertificationCourseId(certificationCourseId) {
  const knexConn = DomainTransaction.getConnection();

  const certificationResultDTO = await knexConn('certification_results')
    .select('certification_results.*')
    .join('user_certification_results', 'user_certification_results.certificationResultId', 'certification_results.id')
    .where('user_certification_results.certificationCourseId', certificationCourseId)
    .first();

  if (!certificationResultDTO) return null;

  const competenceMarks = await knexConn('certification_competence_results')
    .select('competenceId', 'level')
    .where({ certificationResultId: certificationResultDTO.id })
    .orderBy('competenceId');

  return toDomain({ certificationResultDTO, competenceMarks });
}

export async function updateEduV3ExternalJuryResult({ certificationResultId, newExternalJuryResult }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('certification_results')
    .where('certification_results.id', certificationResultId)
    .update({ v3EduExternalJuryResult: newExternalJuryResult, updatedAt: knexConn.fn.now() });
}

export async function updateEduV2ExternalJuryResult({
  certificationResultId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
}) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('certification_results')
    .where('certification_results.id', certificationResultId)
    .update({ v2EduVoletExterneBadgeId, v2EduVoletExterneAcquired, updatedAt: knexConn.fn.now() });
}

function toDB({ certificationResults, userCertificationResults }) {
  const certificationResultsData = certificationResults.map((certificationResult) => ({
    id: certificationResult.id,
    algorithmEngineVersion: certificationResult.algorithmEngineVersion,
    firstName: certificationResult.firstName,
    middleName: certificationResult.middleName,
    thirdName: certificationResult.thirdName,
    lastName: certificationResult.lastName,
    externalId: certificationResult.externalId,
    nationalStudentId: certificationResult.nationalStudentId,
    birthdate: certificationResult.birthdate,
    birthplace: certificationResult.birthplace,
    birthPostalCode: certificationResult.birthPostalCode,
    birthINSEECode: certificationResult.birthINSEECode,
    birthCountry: certificationResult.birthCountry,
    verificationCode: certificationResult.verificationCode,
    certificationCenter: certificationResult.certificationCenter,
    startedAt: certificationResult.startedAt,
    deliveredAt: certificationResult.deliveredAt,
    status: certificationResult.status,
    framework: certificationResult.framework,
    franceCompetencesMinScore: certificationResult.franceCompetencesMinScore,
    commentByAutoJury: certificationResult.commentByAutoJury,
    commentByJury: certificationResult.commentByJury,
    commentForOrganization: certificationResult.commentForOrganization,
    commentForCandidate: certificationResult.commentForCandidate,
    maxReachableLevel: certificationResult.results.maxReachableLevel,
    reachedMeshIndex: certificationResult.results.reachedMeshIndex,
    pixScore: certificationResult.results.pixScore,
    v3EduExternalJuryResult: certificationResult.results.v3EduExternalJuryResult,
    hasAcquiredClea: certificationResult.results.hasAcquiredClea,
    cleaBadgeId: certificationResult.results.cleaBadgeId,
    v2ComplementaryVoletPixBadgeId: certificationResult.results.v2ComplementaryVoletPixBadgeId,
    v2ComplementaryVoletPixAcquired: certificationResult.results.v2ComplementaryVoletPixAcquired,
    v2EduVoletExterneBadgeId: certificationResult.results.v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired: certificationResult.results.v2EduVoletExterneAcquired,
  }));

  const certificationCompetenceResultsData = certificationResults.flatMap((certificationResult) =>
    certificationResult.competenceResults.map((competenceResult) => ({
      certificationResultId: certificationResult.id,
      competenceId: competenceResult.competenceId,
      level: competenceResult.level,
    })),
  );

  const userCertificationResultsData = userCertificationResults.map((userCertificationResult) => ({
    certificationResultId: userCertificationResult.certificationResultId,
    userId: userCertificationResult.userId,
    sessionId: userCertificationResult.sessionId,
    certificationCourseId: userCertificationResult.certificationCourseId,
    organizationLearnerId: userCertificationResult.organizationLearnerId,
  }));

  return {
    certificationResultsData,
    userCertificationResultsData,
    certificationCompetenceResultsData,
  };
}

function toDomain({ certificationResultDTO, competenceMarks }) {
  return new CertificationResult({
    id: certificationResultDTO.id,
    algorithmEngineVersion: certificationResultDTO.algorithmEngineVersion,
    firstName: certificationResultDTO.firstName,
    middleName: certificationResultDTO.middleName,
    thirdName: certificationResultDTO.thirdName,
    lastName: certificationResultDTO.lastName,
    externalId: certificationResultDTO.externalId,
    nationalStudentId: certificationResultDTO.nationalStudentId,
    birthdate: certificationResultDTO.birthdate,
    birthplace: certificationResultDTO.birthplace,
    birthPostalCode: certificationResultDTO.birthPostalCode,
    birthINSEECode: certificationResultDTO.birthINSEECode,
    birthCountry: certificationResultDTO.birthCountry,
    verificationCode: certificationResultDTO.verificationCode,
    certificationCenter: certificationResultDTO.certificationCenter,
    startedAt: certificationResultDTO.startedAt,
    deliveredAt: certificationResultDTO.deliveredAt,
    status: certificationResultDTO.status,
    framework: certificationResultDTO.framework,
    franceCompetencesMinScore: certificationResultDTO.franceCompetencesMinScore,
    commentByAutoJury: certificationResultDTO.commentByAutoJury,
    commentByJury: certificationResultDTO.commentByJury,
    commentForOrganization: certificationResultDTO.commentForOrganization,
    commentForCandidate: certificationResultDTO.commentForCandidate,
    results: {
      maxReachableLevel: certificationResultDTO.maxReachableLevel,
      reachedMeshIndex: certificationResultDTO.reachedMeshIndex,
      pixScore: certificationResultDTO.pixScore,
      competenceMarks,
      v3EduExternalJuryResult: certificationResultDTO.v3EduExternalJuryResult,
      hasAcquiredClea: certificationResultDTO.hasAcquiredClea,
      cleaBadgeId: certificationResultDTO.cleaBadgeId,
      v2ComplementaryVoletPixBadgeId: certificationResultDTO.v2ComplementaryVoletPixBadgeId,
      v2ComplementaryVoletPixAcquired: certificationResultDTO.v2ComplementaryVoletPixAcquired,
      v2EduVoletExterneBadgeId: certificationResultDTO.v2EduVoletExterneBadgeId,
      v2EduVoletExterneAcquired: certificationResultDTO.v2EduVoletExterneAcquired,
    },
  });
}
