import { knex } from '../../../../../db/knex-database-connection.js';

export const save = (certificationChallengeHistory) => {
  return knex('certification-challenge-capacities')
    .insert(certificationChallengeHistory.capacityHistory)
    .onConflict('certificationChallengeId')
    .merge();
};
