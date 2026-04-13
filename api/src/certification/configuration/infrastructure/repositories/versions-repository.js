// @ts-check
/**
 * @typedef {import('../../../shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../shared/domain/models/Challenge.js').Challenge} Challenge
 */
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { Version } from '../../domain/models/Version.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<Version>}
 * @throws {NotFoundError}
 */
export async function getById({ id }) {
  const knexConn = DomainTransaction.getConnection();

  const versionData = await knexConn('certification_versions')
    .select(
      'id',
      'scope',
      'startDate',
      'expirationDate',
      'assessmentDuration',
      'globalScoringConfiguration',
      'competencesScoringConfiguration',
      'challengesConfiguration',
    )
    .where({ id })
    .first();

  if (!versionData) {
    throw new NotFoundError(`Version with id ${id} not found`);
  }

  return _toDomain(versionData);
}

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @returns {Promise<Version|null>}
 */
export async function findActiveByScope({ scope }) {
  const knexConn = DomainTransaction.getConnection();

  const versionData = await knexConn('certification_versions')
    .select(
      'id',
      'scope',
      'startDate',
      'expirationDate',
      'assessmentDuration',
      'globalScoringConfiguration',
      'competencesScoringConfiguration',
      'challengesConfiguration',
    )
    .where({ scope })
    .whereNull('expirationDate')
    .first();

  if (!versionData) {
    return null;
  }

  return _toDomain(versionData);
}

/**
 * @param {object} params
 * @param {Version} params.version
 * @param {Array<Challenge>} params.challenges
 * @returns {Promise<number>} versionId
 */
export async function create({ version, challenges }) {
  const knexConn = DomainTransaction.getConnection();

  const [{ id }] = await knexConn('certification_versions')
    .insert({
      scope: version.scope,
      startDate: version.startDate,
      expirationDate: version.expirationDate,
      assessmentDuration: version.assessmentDuration,
      globalScoringConfiguration: version.globalScoringConfiguration
        ? JSON.stringify(version.globalScoringConfiguration)
        : null,
      competencesScoringConfiguration: version.competencesScoringConfiguration
        ? JSON.stringify(version.competencesScoringConfiguration)
        : null,
      challengesConfiguration: JSON.stringify(version.challengesConfiguration),
    })
    .returning('id');

  const challengesDTO = challenges.map((challenge) => ({
    challengeId: challenge.id,
    versionId: id,
  }));

  await knexConn
    .batchInsert('certification-frameworks-challenges', challengesDTO)
    .transacting(knexConn.isTransaction ? knexConn : null);

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
    expirationDate: version.expirationDate,
    challengesConfiguration: version.challengesConfiguration,
  });
}

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @returns {Promise<Array<number>>}
 */
export async function getFrameworkHistory({ scope }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('certification_versions')
    .select('id', 'startDate', 'expirationDate')
    .where({ scope })
    .orderBy('startDate', 'desc');
}

export async function getFullFrameworkHistory({ scope }) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('certification_versions')
    .select(
      'certification_versions.id',
      'certification_versions.assessmentDuration',
      'certification_versions.startDate',
      'certification_versions.expirationDate',
      knexConn.raw('COUNT("certification-frameworks-challenges"."id") AS "challengesCount"'),
    )
    .leftJoin(
      'certification-frameworks-challenges',
      'certification-frameworks-challenges.versionId',
      'certification_versions.id',
    )
    .where({ scope })
    .groupBy('certification_versions.id')
    .orderBy('certification_versions.startDate', 'desc');
}

const _toDomain = ({
  id,
  scope,
  startDate,
  expirationDate,
  assessmentDuration,
  globalScoringConfiguration,
  competencesScoringConfiguration,
  challengesConfiguration,
}) => {
  return new Version({
    id,
    scope,
    startDate,
    expirationDate,
    assessmentDuration,
    globalScoringConfiguration,
    competencesScoringConfiguration,
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
};
