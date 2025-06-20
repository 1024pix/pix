import { knex as datamartKnex } from '../../../../../datamart/knex-database-connection.js';
import { ActiveCalibratedChallenge } from '../../domain/models/ActiveCalibratedChallenge.js';

export async function findByComplementaryKeyAndChallengeIds({ complementaryCertificationKey, challengeIds }) {
  const activeCalibratedChallenges = await datamartKnex('active_calibrated_challenges')
    .where({
      scope: complementaryCertificationKey,
    })
    .whereIn('challenge_id', challengeIds);

  return activeCalibratedChallenges.map((activeCalibratedChallenge) => toDomain(activeCalibratedChallenge));
}

function toDomain(activeCalibratedChallenge) {
  return new ActiveCalibratedChallenge({
    ...activeCalibratedChallenge,
    challengeId: activeCalibratedChallenge.challenge_id,
  });
}
