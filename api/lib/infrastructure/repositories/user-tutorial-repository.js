const knexConfigs = require('../../../db/knexfile');
const { environment } = require('../../../lib/config');
const knexConfig = knexConfigs[environment];
const knex = require('knex')(knexConfig);

module.exports = {
  async addTutorial({ userId, tutorialId }) {
    await knex.raw('INSERT INTO ??(??, ??) VALUES (?, ?) ON CONFLICT DO NOTHING',
      ['user_tutorials', 'userId', 'tutorialId', userId, tutorialId]);
  },
};
