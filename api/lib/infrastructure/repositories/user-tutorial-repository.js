const { knex } = require('../../../db/knex-database-connection');
const Tutorial = require('../../domain/models/Tutorial');
const UserTutorial = require('../../domain/models/UserTutorial');
const UserTutorialWithTutorial = require('../../domain/models/UserTutorialWithTutorial');
const tutorialDatasource = require('../datasources/learning-content/tutorial-datasource');

module.exports = {
  async addTutorial({ userId, tutorialId }) {
    const userTutorials = await knex('user_tutorials').where({ userId, tutorialId });
    if (userTutorials.length) {
      return _toDomain(userTutorials[0]);
    }
    const savedUserTutorials = await knex('user_tutorials').insert({ userId, tutorialId }).returning('*');
    return _toDomain(savedUserTutorials[0]);
  },

  async find({ userId }) {
    const userTutorials = await knex('user_tutorials').where({ userId });
    return userTutorials.map(_toDomain);
  },

  async findWithTutorial({ userId }) {
    const userTutorials = await knex('user_tutorials').where({ userId });
    return Promise.all(
      userTutorials.map(async (userTutorial) => {
        const tutorial = await tutorialDatasource.get(userTutorial.tutorialId);
        return new UserTutorialWithTutorial({
          ...userTutorial,
          tutorial: new Tutorial(tutorial),
        });
      })
    );
  },

  async removeFromUser(userTutorial) {
    return knex('user_tutorials').where(userTutorial).delete();
  },
};

function _toDomain(userTutorial) {
  return new UserTutorial({
    id: userTutorial.id,
    tutorialId: userTutorial.tutorialId,
    userId: userTutorial.userId,
  });
}
