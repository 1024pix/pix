import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * Persiste les challenges calibrés d'une calibration dans la table certification-frameworks-challenges.
 *
 * @param {object} params
 * @param {import('../../domain/models/Calibration.js').CalibratedChallenge[]} params.calibratedChallenges
 * @param {number} params.versionId
 */
export async function saveMany({ calibratedChallenges, versionId }) {
  const knexConn = DomainTransaction.getConnection();

  const rows = calibratedChallenges.map(({ challengeId, alpha, delta }) => ({
    versionId,
    challengeId,
    discriminant: alpha,
    difficulty: delta,
  }));

  await knexConn.batchInsert('certification-frameworks-challenges', rows);
}
