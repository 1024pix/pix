const knexConfigs = require('../../../db/knexfile');
const { environment } = require('../../../lib/config');
const knexConfig = knexConfigs[environment];
const knex = require('knex')(knexConfig);

module.exports = {
  async addTutorial({ userId, tutorialId }) {
    const userTutorial = await knex('user_tutorials').where({ userId, tutorialId }).first();
    if (userTutorial) {
      return userTutorial;
    }
    const rawUserTutorial = await knex('user_tutorials').insert({ userId, tutorialId }).returning('*');
    return rawUserTutorial[0];
  },

  async find({ userId }) {
    return knex('user_tutorials').where({ userId });
  },

  async removeFromUser(userTutorial) {
    return knex('user_tutorials').where(userTutorial).del();
  },
};
