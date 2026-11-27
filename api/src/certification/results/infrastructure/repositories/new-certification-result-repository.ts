import type { UUID } from 'node:crypto';

import type { Knex } from 'knex';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import type { Framework } from '../../../shared/domain/types.ts';
import type { Results } from '../../domain/models/NewCertificationResult.schema.ts';
import { CertificationResult, type UserCertificationResult } from '../../domain/models/NewCertificationResult.ts';
import type { CertificationResultStatus } from '../../domain/types.ts';

// Each Results variant only has its own fields, so TS refuses e.g. `results.pixScore`
// on the union. The table stores them all flat: missing fields are left out (NULL).
type ResultsColumns = {
  pixScore?: number | null;
  maxReachableLevel?: number;
  reachedMeshIndex?: number | null;
  v3EduExternalJuryResult?: string | null;
  hasAcquiredClea?: boolean;
  cleaBadgeId?: number;
  v2ComplementaryVoletPixBadgeId?: number;
  v2ComplementaryVoletPixAcquired?: boolean;
  v2EduVoletExterneBadgeId?: number | null;
  v2EduVoletExterneAcquired?: boolean | null;
};

type CertificationResultRow = ResultsColumns & {
  id: UUID;
  algorithmEngineVersion: number;
  firstName: string;
  middleName: string | null;
  thirdName: string | null;
  lastName: string;
  externalId: string | null;
  nationalStudentId: string | null;
  birthdate: string;
  birthplace: string;
  birthPostalCode: string | null;
  birthINSEECode: string | null;
  birthCountry: string | null;
  verificationCode: string;
  certificationCenter: string;
  startedAt: Date;
  deliveredAt: Date;
  status: CertificationResultStatus;
  framework: Framework;
  franceCompetencesMinScore: number | null;
  commentByAutoJury: string | null;
  commentByJury: string | null;
  commentForOrganization: string | null;
  commentForCandidate: string | null;
};

type CompetenceMarkRow = { competenceId: string; level: number };

type SaveParams = {
  certificationResults: CertificationResult[];
  userCertificationResults: UserCertificationResult[];
};

export async function save({ certificationResults, userCertificationResults }: SaveParams): Promise<void> {
  const knexConn = DomainTransaction.getConnection();
  const { certificationResultsData, certificationCompetenceResultsData, userCertificationResultsData } = toDB({
    certificationResults,
    userCertificationResults,
  });
  if (certificationResultsData.length > 0) {
    await insertInBatch(knexConn, 'certification_results', certificationResultsData);
  }
  if (certificationCompetenceResultsData.length > 0) {
    await insertInBatch(knexConn, 'certification_competence_results', certificationCompetenceResultsData);
  }
  if (userCertificationResultsData.length > 0) {
    await insertInBatch(knexConn, 'user_certification_results', userCertificationResultsData);
  }
}

export async function deleteBySession(sessionId: number): Promise<void> {
  const knexConn = DomainTransaction.getConnection();
  const deletedUserCertificationResults: Array<{ certificationResultId: string }> = await knexConn(
    'user_certification_results',
  )
    .where({ sessionId })
    .delete()
    .returning('certificationResultId');
  if (deletedUserCertificationResults.length === 0) {
    return;
  }
  const certificationResultIds = deletedUserCertificationResults.map(
    ({ certificationResultId }) => certificationResultId,
  );
  await knexConn('certification_competence_results').whereIn('certificationResultId', certificationResultIds).delete();
  await knexConn('certification_results').whereIn('id', certificationResultIds).delete();
}

export async function getByCertificationCourseId(certificationCourseId: number): Promise<CertificationResult | null> {
  const knexConn = DomainTransaction.getConnection();

  const certificationResultDTO = await knexConn('certification_results')
    .select('certification_results.*')
    .join('user_certification_results', 'user_certification_results.certificationResultId', 'certification_results.id')
    .where('user_certification_results.certificationCourseId', certificationCourseId)
    .first<CertificationResultRow | undefined>();

  if (!certificationResultDTO) return null;

  const competenceMarks = await knexConn<CompetenceMarkRow & { certificationResultId: UUID }>(
    'certification_competence_results',
  )
    .select('competenceId', 'level')
    .where({ certificationResultId: certificationResultDTO.id })
    .orderBy('competenceId');

  return toDomain({ certificationResultDTO, competenceMarks });
}

export async function updateEduV3ExternalJuryResult({
  certificationResultId,
  newExternalJuryResult,
}: {
  certificationResultId: UUID;
  newExternalJuryResult: string | null;
}): Promise<void> {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('certification_results')
    .where('certification_results.id', certificationResultId)
    .update({ v3EduExternalJuryResult: newExternalJuryResult, updatedAt: knexConn.fn.now() });
}

export async function updateEduV2ExternalJuryResult({
  certificationResultId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
}: {
  certificationResultId: UUID;
  v2EduVoletExterneBadgeId: number | null;
  v2EduVoletExterneAcquired: boolean | null;
}): Promise<void> {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('certification_results')
    .where('certification_results.id', certificationResultId)
    .update({ v2EduVoletExterneBadgeId, v2EduVoletExterneAcquired, updatedAt: knexConn.fn.now() });
}

function toDB({ certificationResults, userCertificationResults }: SaveParams) {
  const certificationResultsData = certificationResults.map((certificationResult) => {
    const results: ResultsColumns = certificationResult.results;
    return {
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
      maxReachableLevel: results.maxReachableLevel,
      reachedMeshIndex: results.reachedMeshIndex,
      pixScore: results.pixScore,
      v3EduExternalJuryResult: results.v3EduExternalJuryResult,
      hasAcquiredClea: results.hasAcquiredClea,
      cleaBadgeId: results.cleaBadgeId,
      v2ComplementaryVoletPixBadgeId: results.v2ComplementaryVoletPixBadgeId,
      v2ComplementaryVoletPixAcquired: results.v2ComplementaryVoletPixAcquired,
      v2EduVoletExterneBadgeId: results.v2EduVoletExterneBadgeId,
      v2EduVoletExterneAcquired: results.v2EduVoletExterneAcquired,
    };
  });

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

function toDomain({
  certificationResultDTO,
  competenceMarks,
}: {
  certificationResultDTO: CertificationResultRow;
  competenceMarks: CompetenceMarkRow[];
}): CertificationResult {
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
    // The flat row can't tell TS which Results variant it holds: all columns are passed as is.
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
    } as Results,
  });
}

async function insertInBatch(knexConn: Knex, tableName: string, rows: readonly object[]) {
  const query = knexConn.batchInsert(tableName, rows);
  if (knexConn.isTransaction) {
    await query.transacting(knexConn as Knex.Transaction);
  } else {
    await query;
  }
}
