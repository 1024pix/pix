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
  const versionsData = await buildBaseQuery();

  return versionsData.map(_toDomain);
}

/**
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<Version>}
 * @throws {NotFoundError}
 */
export async function getById({ id }) {
  const versionData = await buildBaseQuery().where({ id }).first();

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
  const dtosVersion = await buildBaseQuery().where({ scope });
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

  const versionLinkedTubeIds = version.tubeIds.map((tubeId) => ({ tube_id: tubeId, version_id: id }));

  await knexConn.batchInsert('certification_versions_tubes', versionLinkedTubeIds);

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

export async function remove(id) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification_versions_tubes').where({ version_id: id }).delete();
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

function buildBaseQuery() {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('certification_versions')
    .join('certification_versions_tubes', 'certification_versions_tubes.version_id', 'certification_versions.id')
    .select('certification_versions.*', {
      tubeIds: knexConn.raw(`array_agg(certification_versions_tubes.tube_id)`),
    })
    .groupBy('certification_versions.id')
    .orderBy('certification_versions.id');
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
  tubeIds,
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
    tubeIds,
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
