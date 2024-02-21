import { knex } from '../../../../../db/knex-database-connection.js';

export const saveBatch = (certificationChallengeCapacities) => {
  return knex('certification-challenge-capacities')
    .insert(certificationChallengeCapacities)
    .onConflict('certificationChallengeId')
    .merge();
};
