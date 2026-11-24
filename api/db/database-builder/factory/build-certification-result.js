import { randomUUID } from 'node:crypto';

import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { databaseBuffer } from '../database-buffer.ts';

/**
 * @typedef {object} CompetenceMarkRow
 * @property {string} competenceId
 * @property {number} level
 */

/**
 * @typedef {object} CertificationResultRow
 * @property {string} id
 * @property {AlgorithmEngineVersion} algorithmEngineVersion
 * @property {string} firstName
 * @property {string | null} middleName
 * @property {string | null} thirdName
 * @property {string} lastName
 * @property {string | null} externalId
 * @property {string | null} nationalStudentId
 * @property {string} birthdate
 * @property {string} birthplace
 * @property {string | null} birthPostalCode
 * @property {string | null} birthINSEECode
 * @property {string | null} birthCountry
 * @property {string} verificationCode
 * @property {string} certificationCenter
 * @property {Date} startedAt
 * @property {Date} deliveredAt
 * @property {string} status
 * @property {string} framework
 * @property {number | null} franceCompetencesMinScore
 * @property {number} maxReachableLevel
 * @property {number | null} reachedMeshIndex
 * @property {number | null} pixScore
 * @property {string} competenceMarks - JSON stringified array of CompetenceMarkRow
 * @property {string | null} v3EduExternalJuryResult
 * @property {boolean | null} hasAcquiredClea
 * @property {number | null} cleaBadgeId
 * @property {number | null} v2ComplementaryVoletPixBadgeId
 * @property {boolean | null} v2ComplementaryVoletPixAcquired
 * @property {number | null} v2EduVoletExterneBadgeId
 * @property {boolean | null} v2EduVoletExterneAcquired
 */

/**
 * Builds a certification result and pushes it into the database buffer.
 *
 * @param {undefined | object} params
 * @param {undefined | string} params.id
 * @param {undefined | AlgorithmEngineVersion} params.algorithmEngineVersion
 * @param {undefined | string} params.firstName
 * @param {undefined | string | null} params.middleName
 * @param {undefined | string | null} params.thirdName
 * @param {undefined | string} params.lastName
 * @param {undefined | string | null} params.externalId
 * @param {undefined | string | null} params.nationalStudentId
 * @param {undefined | string} params.birthdate
 * @param {undefined | string} params.birthplace
 * @param {undefined | string | null} params.birthPostalCode
 * @param {undefined | string | null} params.birthINSEECode
 * @param {undefined | string | null} params.birthCountry
 * @param {undefined | string} params.verificationCode
 * @param {undefined | string} params.certificationCenter
 * @param {undefined | Date} params.startedAt
 * @param {undefined | Date} params.deliveredAt
 * @param {undefined | string} params.status
 * @param {undefined | string} params.framework
 * @param {undefined | number | null} params.franceCompetencesMinScore
 * @param {undefined | number} params.maxReachableLevel
 * @param {undefined | number | null} params.reachedMeshIndex
 * @param {undefined | number | null} params.pixScore
 * @param {undefined | Array<CompetenceMarkRow> | null} params.competenceMarks
 * @param {undefined | string | null} params.v3EduExternalJuryResult
 * @param {undefined | boolean | null} params.hasAcquiredClea
 * @param {undefined | number | null} params.cleaBadgeId
 * @param {undefined | number | null} params.v2ComplementaryVoletPixBadgeId
 * @param {undefined | boolean | null} params.v2ComplementaryVoletPixAcquired
 * @param {undefined | number | null} params.v2EduVoletExterneBadgeId
 * @param {undefined | boolean | null} params.v2EduVoletExterneAcquired
 * @returns {CertificationResultRow}
 */
export function buildCertificationResult({
  id = randomUUID(),
  algorithmEngineVersion = AlgorithmEngineVersion.V3,
  firstName = 'first-name',
  middleName = 'middle-name',
  thirdName = 'third-name',
  lastName = 'last-name',
  externalId = 'externalId',
  nationalStudentId = 'nationalStudentId',
  birthdate = '2001-05-21',
  birthplace = 'Paris',
  birthPostalCode = '66000',
  birthINSEECode = null,
  birthCountry = 'FRANCE',
  verificationCode = 'VERIFCODE',
  certificationCenter = 'Meilleur centre de certif',
  startedAt = new Date('2026-01-01'),
  deliveredAt = new Date('2026-01-03'),
  status = 'cancelled',
  framework = 'CORE',
  franceCompetencesMinScore = 100,
  maxReachableLevel = 7,
  reachedMeshIndex = 2,
  pixScore = 186,
  competenceMarks = [{ competenceId: 'competenceABC123', level: 2 }],
  v3EduExternalJuryResult = null,
  hasAcquiredClea = null,
  cleaBadgeId = null,
  v2ComplementaryVoletPixBadgeId = null,
  v2ComplementaryVoletPixAcquired = null,
  v2EduVoletExterneBadgeId = null,
  v2EduVoletExterneAcquired = null,
} = {}) {
  const competences =
    competenceMarks?.map(({ competenceId, level }) => ({
      certificationResultId: id,
      competenceId,
      level,
    })) ?? [];
  const values = {
    id,
    algorithmEngineVersion,
    firstName,
    middleName,
    thirdName,
    lastName,
    externalId,
    nationalStudentId,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    verificationCode,
    certificationCenter,
    startedAt,
    deliveredAt,
    status,
    framework,
    franceCompetencesMinScore,
    maxReachableLevel,
    reachedMeshIndex,
    pixScore,
    v3EduExternalJuryResult,
    hasAcquiredClea,
    cleaBadgeId,
    v2ComplementaryVoletPixBadgeId,
    v2ComplementaryVoletPixAcquired,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
  };
  databaseBuffer.pushInsertable({
    tableName: 'certification_results',
    values,
  });
  for (const competence of competences) {
    databaseBuffer.pushInsertable({
      tableName: 'certification_competence_results',
      values: competence,
    });
  }
  return values;
}
