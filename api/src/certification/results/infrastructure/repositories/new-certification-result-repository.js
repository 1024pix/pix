import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

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
