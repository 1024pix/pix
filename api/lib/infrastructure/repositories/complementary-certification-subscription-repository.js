import { knex } from '../../../db/knex-database-connection.js';

const save = async function (complementaryCertificationSubscription) {
  return knex('complementary-certification-subscriptions').insert(complementaryCertificationSubscription);
};

export { save };
