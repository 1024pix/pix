const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async isNewFormat(targetProfileId) {
    const hasAtLeastOneTube = await knex('target-profile_tubes')
      .select('id')
      .where('targetProfileId', targetProfileId)
      .first();
    return Boolean(hasAtLeastOneTube);
  },
};
