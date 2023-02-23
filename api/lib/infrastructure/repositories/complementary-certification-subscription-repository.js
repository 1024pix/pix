const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async save(complementaryCertificationSubscription) {
    return knex('complementary-certification-subscriptions').insert(complementaryCertificationSubscription);
  },
};
