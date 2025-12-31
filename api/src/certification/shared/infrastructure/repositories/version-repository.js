/**
 * @typedef {import('../../../shared/domain/models/Scopes.js').SCOPES} SCOPES
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { Version } from '../../domain/models/Version.js';

/**
 * @param {number} versionId
 * @returns {Promise<Version>}
 */
export const getById = async (versionId) => {
  const knexConn = DomainTransaction.getConnection();

  const versionData = await knexConn('certification_versions')
    .select('id', 'scope', 'challengesConfiguration')
    .where({ id: versionId })
    .first();

  if (!versionData) {
    throw new NotFoundError(`No certification version found for id ${versionId}`);
  }

  return _toDomain(versionData);
};

/**
 * @param {object} params
 * @param {SCOPES} params.scope
 * @param {Date} params.reconciliationDate
 * @returns {Promise<Version>}
 */
export const getByScopeAndReconciliationDate = async ({ scope, reconciliationDate }) => {
  const knexConn = DomainTransaction.getConnection();

  const versionData = await knexConn('certification_versions')
    .select('id', 'scope', 'challengesConfiguration')
    .where({ scope })
    .andWhere('startDate', '<=', reconciliationDate)
    .andWhere((queryBuilder) => {
      queryBuilder.whereNull('expirationDate').orWhere('expirationDate', '>', reconciliationDate);
    })
    .orderBy('startDate', 'desc')
    .first();

  if (!versionData) {
    throw new NotFoundError('No certification framework version found for the given scope and reconciliationDate');
  }

  return _toDomain(versionData);
};

const _toDomain = ({ id, scope, challengesConfiguration }) => {
  return new Version({
    id,
    scope,
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
