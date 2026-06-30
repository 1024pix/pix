// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationFrameworksChallenge } from '../../domain/models/CertificationFrameworksChallenge.js';

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
 * @param {CertificationFrameworksChallenge[]} certificationChallenges
 * @returns {Promise<Array<string>>}
 * @throws {NotFoundError}
 */
export async function create(certificationChallenges) {
  const knexConn = DomainTransaction.getConnection();
  const certificationChallengesData = certificationChallenges.map((certificationChallenge) => ({
    versionId: certificationChallenge.versionId,
    challengeId: certificationChallenge.challengeId,
    discriminant: certificationChallenge.discriminant,
    difficulty: certificationChallenge.difficulty,
  }));

  await knexConn.batchInsert('certification-frameworks-challenges', certificationChallengesData);
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
