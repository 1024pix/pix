import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import type { AutoJuryCommentKey, Framework } from '../../../shared/domain/types.ts';
import { CertificationResultForCsv } from '../../domain/read-models/CertificationResultForCsv.ts';
import type { CertificationResultStatus } from '../../domain/types.ts';

type CompetenceMarkDB = {
  competenceId: string;
  level: number;
};

type Row = {
  certificationId: number;
  firstName: string;
  lastName: string;
  birthdate: string;
  birthplace: string;
  externalId: string | null;
  framework: Framework;
  status: CertificationResultStatus;
  reachedMeshIndex: number | null;
  pixScore: number | null;
  competenceMarks: CompetenceMarkDB[] | null;
  hasAcquiredClea: boolean | null;
  commentForOrganization: string | null;
  commentByAutoJury: AutoJuryCommentKey | null;
  sessionId: number;
  certificationCenter: string;
  startedAt: Date;
};

export async function findBySessionAndResultRecipient({
  sessionId,
  resultRecipientEmail,
}: {
  sessionId: number;
  resultRecipientEmail: string;
}) {
  const rows = await baseQuery()
    .join('certification-courses', 'certification-courses.id', 'user_certification_results.certificationCourseId')
    .join('certification-candidates', 'certification-candidates.id', 'certification-courses.candidateId')
    .where('certification-candidates.sessionId', sessionId)
    .whereILike('certification-candidates.resultRecipientEmail', resultRecipientEmail)
    .orderBy('certification_results.id');

  const pixCompetences = await competenceRepository.listPixCompetencesOnly();
  const codeById = new Map<string, string>(
    pixCompetences.map((pixCompetence) => [pixCompetence.id, pixCompetence.index]),
  );
  return rows.map((row: Row) => toDomain(row, codeById));
}

export async function findMostRecentByLearners({ learnerIds }: { learnerIds: number[] }) {
  const knexConn = DomainTransaction.getConnection();
  const mostRecentByLearner = baseQuery()
    .whereIn('user_certification_results.organizationLearnerId', learnerIds)
    .distinctOn('user_certification_results.organizationLearnerId')
    .orderBy('user_certification_results.organizationLearnerId')
    .orderBy('certification_results.startedAt', 'desc')
    .orderBy('certification_results.id', 'desc')
    .as('mostRecentByLearner');

  const rows = await knexConn.select('*').from(mostRecentByLearner).orderBy('lastName').orderBy('firstName');

  const codesById = await findCompetenceCodesbyId();
  return rows.map((row: Row) => toDomain(row, codesById));
}

function baseQuery() {
  const knexConn = DomainTransaction.getConnection();

  return knexConn<Row[]>('certification_results')
    .select({
      certificationId: 'user_certification_results.certificationCourseId',
      sessionId: 'user_certification_results.sessionId',
      firstName: 'certification_results.firstName',
      lastName: 'certification_results.lastName',
      birthdate: 'certification_results.birthdate',
      birthplace: 'certification_results.birthplace',
      externalId: 'certification_results.externalId',
      framework: 'certification_results.framework',
      status: 'certification_results.status',
      reachedMeshIndex: 'certification_results.reachedMeshIndex',
      pixScore: 'certification_results.pixScore',
      competenceMarks: 'certification_results.competenceMarks',
      hasAcquiredClea: 'certification_results.hasAcquiredClea',
      commentForOrganization: 'certification_results.commentForOrganization',
      commentByAutoJury: 'certification_results.commentByAutoJury',
      certificationCenter: 'certification_results.certificationCenter',
      startedAt: 'certification_results.startedAt',
    })
    .join('user_certification_results', 'user_certification_results.certificationResultId', 'certification_results.id');
}

async function findCompetenceCodesbyId() {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly();
  return new Map<string, string>(pixCompetences.map((pixCompetence) => [pixCompetence.id, pixCompetence.index]));
}

function toDomain(row: Row, codesById: Map<string, string>) {
  const competenceMarks =
    row.competenceMarks?.map((competenceMark) => {
      const competenceCode = codesById.get(competenceMark.competenceId) as string;
      return {
        competenceCode,
        level: competenceMark.level,
      };
    }) ?? null;
  return new CertificationResultForCsv({
    ...row,
    competenceMarks,
  });
}
