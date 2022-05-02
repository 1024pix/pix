const { knex } = require('../../../db/knex-database-connection');
const Tutorial = require('../../domain/models/Tutorial');
const UserSavedTutorial = require('../../domain/models/UserSavedTutorial');
const UserSavedTutorialWithTutorial = require('../../domain/models/UserSavedTutorialWithTutorial');
const tutorialDatasource = require('../datasources/learning-content/tutorial-datasource');

const TABLE_NAME = 'user-saved-tutorials';

module.exports = {
  async addTutorial({ userId, tutorialId, skillId }) {
    const userSavedTutorials = await knex(TABLE_NAME).where({ userId, tutorialId });
    if (userSavedTutorials.length) {
      return _toDomain(userSavedTutorials[0]);
    }
    const savedUserSavedTutorials = await knex(TABLE_NAME).insert({ userId, tutorialId, skillId }).returning('*');
    return _toDomain(savedUserSavedTutorials[0]);
  },

  async find({ userId }) {
    const userSavedTutorials = await knex(TABLE_NAME).where({ userId }).orderBy('id', 'desc');
    return userSavedTutorials.map(_toDomain);
  },

  // TODO delete when tutorial V2 becomes main version
  async findWithTutorial({ userId }) {
    const userSavedTutorials = await knex(TABLE_NAME).where({ userId });
    const tutorials = await tutorialDatasource.findByRecordIds(userSavedTutorials.map(({ tutorialId }) => tutorialId));
    return tutorials.map((tutorial) => {
      const userSavedTutorial = userSavedTutorials.find(({ tutorialId }) => tutorialId === tutorial.id);
      return new UserSavedTutorialWithTutorial({
        ...userSavedTutorial,
        tutorial: new Tutorial(tutorial),
      });
    });
  },

  async removeFromUser(userSavedTutorial) {
    return knex(TABLE_NAME).where(userSavedTutorial).delete();
  },
};

function _toDomain(userSavedTutorial) {
  return new UserSavedTutorial({
    id: userSavedTutorial.id,
    tutorialId: userSavedTutorial.tutorialId,
    userId: userSavedTutorial.userId,
    skillId: userSavedTutorial.skillId,
    createdAt: userSavedTutorial.createdAt,
  });
}
