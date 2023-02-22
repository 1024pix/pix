import { knex } from '../../../db/knex-database-connection';
import UserSavedTutorial from '../../domain/models/UserSavedTutorial';

const TABLE_NAME = 'user-saved-tutorials';

export default {
  async addTutorial({ userId, tutorialId, skillId }) {
    const userSavedTutorials = await knex(TABLE_NAME).where({ userId, tutorialId });
    if (userSavedTutorials.length) {
      return _toDomain(userSavedTutorials[0]);
    }
    const savedUserSavedTutorials = await knex(TABLE_NAME).insert({ userId, tutorialId, skillId }).returning('*');
    return _toDomain(savedUserSavedTutorials[0]);
  },

  async find({ userId }) {
    const userSavedTutorials = await knex(TABLE_NAME).where({ userId }).orderBy('createdAt', 'desc');
    return userSavedTutorials.map(_toDomain);
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
