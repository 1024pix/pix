// @ts-check
/**
 * @typedef {import("../../../shared/domain/models/Scopes.js").SCOPES} SCOPES
 * @typedef {import("../../../../shared/domain/models/Challenge.js").Challenge} Challenge
 */
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { Version, VERSION_STATUSES } from '../../domain/models/Version.js';
import { FrameworkHistoryEntry } from '../../domain/read-models/FrameworkHistoryEntry.js';

/**
 * @returns {Promise<Version[]>}
 */
export async function findAll() {
  const knexConn = DomainTransaction.getConnection();

  const versionsData = await knexConn('certification_versions').select('*').orderBy('id');

  return versionsData.map(_toDomain);
}

/**
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<Version>}
 * @throws {NotFoundError}
 */
export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();

  const versionData = await knexConn('certification_versions').select('*').where({ id }).first();

  if (!versionData) {
    throw new NotFoundError(`Version with id ${id} not found`);
  }

  return _toDomain(versionData);
}

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @returns {Promise<Version[]>}
 */
export async function findAllByScope({ scope }) {
  const knexConn = DomainTransaction.getConnection();

  const dtosVersion = await knexConn('certification_versions').select('*').where({ scope }).orderBy('id');

  return dtosVersion.map(_toDomain);
}

/**
 * @param {Version} version
 * @returns {Promise<number>} versionId
 */
export async function create(version) {
  const knexConn = DomainTransaction.getConnection();

  const [{ id }] = await knexConn('certification_versions')
    .insert({
      scope: version.scope,
      startDate: version.startDate,
      expirationDate: version.expirationDate,
      assessmentDuration: version.assessmentDuration,
      minimumAnswersRequiredToValidateACertification: version.minimumAnswersRequiredToValidateACertification,
      globalScoringConfiguration: version.globalScoringConfiguration
        ? JSON.stringify(version.globalScoringConfiguration)
        : null,
      competencesScoringConfiguration: version.competencesScoringConfiguration
        ? JSON.stringify(version.competencesScoringConfiguration)
        : null,
      challengesConfiguration: JSON.stringify(version.challengesConfiguration),
      status: VERSION_STATUSES.DRAFT,
    })
    .returning('id');

  return id;
}

/**
 * @param {object} params
 * @param {Version} params.version
 * @returns {Promise<void>}
 */
export async function update({ version }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('certification_versions').where({ id: version.id }).update({
    comments: version.comments,
    expirationDate: version.expirationDate,
    challengesConfiguration: version.challengesConfiguration,
  });
}

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @returns {Promise<Array<FrameworkHistoryEntry>>}
 */
export async function getFrameworkHistory({ scope }) {
  const knexConn = DomainTransaction.getConnection();

  const rows = await knexConn('certification_versions')
    .select('id', 'startDate', 'expirationDate', 'assessmentDuration', 'challengesConfiguration', 'status')
    .where({ scope })
    .orderBy('startDate', 'desc');

  return rows.map(_toFrameworkHistoryEntry);
}

export async function deleteVersion(id) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-frameworks-challenges').where({ versionId: id }).del();
  await knexConn('certification_versions').where({ id }).del();
}

function _toFrameworkHistoryEntry({
  id,
  startDate,
  expirationDate,
  assessmentDuration,
  challengesConfiguration,
  status,
}) {
  return new FrameworkHistoryEntry({
    id,
    startDate,
    expirationDate,
    assessmentDuration,
    maximumAssessmentLength: challengesConfiguration.maximumAssessmentLength,
    status,
  });
}

function _toDomain({
  id,
  scope,
  startDate,
  expirationDate,
  assessmentDuration,
  minimumAnswersRequiredToValidateACertification,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  challengesConfiguration,
  status,
  comments,
}) {
  return new Version({
    id,
    scope,
    startDate,
    expirationDate,
    minimumAnswersRequiredToValidateACertification,
    assessmentDuration,
    globalScoringConfiguration,
    competencesScoringConfiguration,
    status,
    comments,
    challengesConfiguration: new FlashAssessmentAlgorithmConfiguration({
      maximumAssessmentLength: challengesConfiguration.maximumAssessmentLength,
      challengesBetweenSameCompetence: challengesConfiguration.challengesBetweenSameCompetence,
      limitToOneQuestionPerTube: challengesConfiguration.limitToOneQuestionPerTube,
      enablePassageByAllCompetences: challengesConfiguration.enablePassageByAllCompetences,
      variationPercent: challengesConfiguration.variationPercent,
      defaultCandidateCapacity: challengesConfiguration.defaultCandidateCapacity,
      defaultProbabilityToPickChallenge: challengesConfiguration.defaultProbabilityToPickChallenge,
    }),
  });
}
