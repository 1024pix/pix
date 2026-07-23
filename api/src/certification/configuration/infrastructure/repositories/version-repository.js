// @ts-check
/**
 * @typedef {import("../../../shared/domain/models/Scopes.js").SCOPES} SCOPES
 * @typedef {import("../../../../shared/domain/models/Challenge.js").Challenge} Challenge
 */
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { Version } from '../../domain/models/Version.js';

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
export async function save(version) {
  const knexConn = DomainTransaction.getConnection();
  const dataToInsert = {
    id: version.id ?? undefined,
    scope: version.scope,
    startDate: version.startDate,
    expirationDate: version.expirationDate,
    assessmentDuration: version.assessmentDuration,
    minimumAnswersRequiredToValidateACertification: version.minimumAnswersRequiredToValidateACertification,
    comments: version.comments,
    globalScoringConfiguration: version.globalScoringConfiguration
      ? JSON.stringify(version.globalScoringConfiguration)
      : null,
    competencesScoringConfiguration: version.competencesScoringConfiguration
      ? JSON.stringify(version.competencesScoringConfiguration)
      : null,
    challengesConfiguration: JSON.stringify(version.challengesConfiguration),
    status: version.status,
  };

  const [{ id }] = await knexConn('certification_versions')
    .insert(dataToInsert)
    .onConflict('id')
    .merge()
    .returning('id');

  await knexConn('certification_versions_tubes').where('version_id', id).del();

  const versionLinkedTubeIds = version.tubeIds.map((tubeId) => ({ tube_id: tubeId, version_id: id }));

  await knexConn.batchInsert('certification_versions_tubes', versionLinkedTubeIds);

  return id;
}

export async function remove(id) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification_versions_tubes').where({ version_id: id }).delete();
  await knexConn('certification_versions').where({ id }).del();
}

export async function updateComments({ id, comments }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification_versions').where({ id }).update({
    comments,
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
