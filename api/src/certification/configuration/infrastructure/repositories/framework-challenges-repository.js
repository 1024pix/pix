// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationFrameworksChallenge } from '../../domain/models/CertificationFrameworksChallenge.js';

/**
 * @param {object} params
 * @returns {Promise<Array<string>>}
 * @throws {NotFoundError}
 */
export async function createFromChallengeIds({ versionId, challengeIds = [] }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationFrameworksChallenge = challengeIds.map((challengeId) => {
    return {
      versionId,
      challengeId,
    };
  });

  return await knexConn
    .batchInsert('certification-frameworks-challenges', certificationFrameworksChallenge)
    .returning('id');
}

/**
 * @param {object} params
 * @param {number} params.versionId
 * @returns {Promise<Array<CertificationFrameworksChallenge>>}
 * @throws {NotFoundError}
 */
export async function getByVersionId({ versionId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationFrameworksChallengesDTO = await knexConn('certification-frameworks-challenges')
    .select('discriminant', 'difficulty', 'challengeId', 'versionId')
    .where({ versionId })
    .orderBy('challengeId');

  if (certificationFrameworksChallengesDTO.length === 0) {
    throw new NotFoundError('Framework challenges do not exist for this version');
  }

  return _toDomain({ certificationFrameworksChallengesDTO });
}

/**
 * @param {Array<CertificationFrameworksChallenge>} challenges
 * @returns {Promise<void>}
 */
export async function update(challenges) {
  const knexConn = DomainTransaction.getConnection();

  // Note: cannot do onConflict.merge here because ['versionId', 'challengeId'] has no composite index
  for (const { versionId, discriminant, difficulty, challengeId } of challenges) {
    await knexConn('certification-frameworks-challenges')
      .update({
        discriminant,
        difficulty,
      })
      .where({
        versionId,
        challengeId,
      });
  }
}

function _toDomain({ certificationFrameworksChallengesDTO }) {
  return certificationFrameworksChallengesDTO.map(
    ({ versionId, challengeId, discriminant, difficulty }) =>
      new CertificationFrameworksChallenge({
        versionId,
        challengeId,
        discriminant,
        difficulty,
      }),
  );
}
