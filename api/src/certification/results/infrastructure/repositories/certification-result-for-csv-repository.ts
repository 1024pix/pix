import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import type { AutoJuryCommentKey, Framework } from '../../../shared/domain/types.ts';
import type { CompetenceMark } from '../../domain/read-models/CertificationResultForCsv.ts';
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
  competenceMarks: CompetenceMarkDB[];
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

  if (rows.length === 0) {
    return [];
  }

  const pixCompetences = await competenceRepository.listPixCompetencesOnly();
  const codeById = new Map<string, string>(
    pixCompetences.map((pixCompetence) => [pixCompetence.id, pixCompetence.index]),
  );

  return rows.map((row: Row) => toDomain(row, codeById));
}

export async function findBySession({ sessionId }: { sessionId: number }) {
  const rows = await baseQuery()
    .where('user_certification_results.sessionId', sessionId)
    .orderBy('certification_results.id');

  if (rows.length === 0) {
    return [];
  }

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
    .as('mostRecentByLearner');

  const rows = await knexConn.select('*').from(mostRecentByLearner).orderBy('lastName').orderBy('firstName');
  if (rows.length === 0) {
    return [];
  }

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
      competenceMarks: knexConn.raw(`
        json_agg(
          json_build_object('level', "certification_competence_results".level, 'competenceId', "certification_competence_results"."competenceId")
          ORDER BY "certification_competence_results"."competenceId" asc
        )`),
      hasAcquiredClea: 'certification_results.hasAcquiredClea',
      commentForOrganization: 'certification_results.commentForOrganization',
      commentByAutoJury: 'certification_results.commentByAutoJury',
      certificationCenter: 'certification_results.certificationCenter',
      startedAt: 'certification_results.startedAt',
    })
    .leftJoin(
      'certification_competence_results',
      'certification_competence_results.certificationResultId',
      'certification_results.id',
    )
    .join('user_certification_results', 'user_certification_results.certificationResultId', 'certification_results.id')
    .groupBy('certification_results.id', 'user_certification_results.certificationResultId');
}

async function findCompetenceCodesbyId() {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly();
  return new Map<string, string>(pixCompetences.map((pixCompetence) => [pixCompetence.id, pixCompetence.index]));
}

function toDomain(row: Row, codesById: Map<string, string>) {
  let competenceMarks: CompetenceMark[];
  if (row.competenceMarks[0].competenceId === null) {
    competenceMarks = [];
  } else {
    competenceMarks = row.competenceMarks.map((competenceMark) => {
      const competenceCode = codesById.get(competenceMark.competenceId) as string;
      return {
        competenceCode,
        level: competenceMark.level,
      };
    });
  }
  return new CertificationResultForCsv({
    ...row,
    competenceMarks,
  });
}
