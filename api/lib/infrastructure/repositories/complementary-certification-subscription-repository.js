import { knex } from '../../../db/knex-database-connection';

export default {
  async save(complementaryCertificationSubscription) {
    return knex('complementary-certification-subscriptions').insert(complementaryCertificationSubscription);
  },
};
