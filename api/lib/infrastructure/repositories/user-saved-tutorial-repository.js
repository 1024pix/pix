import { knex } from '../../../db/knex-database-connection.js';
import { UserSavedTutorial } from '../../domain/models/UserSavedTutorial.js';

const TABLE_NAME = 'user-saved-tutorials';

const addTutorial = async function ({ userId, tutorialId, skillId }) {
  const userSavedTutorials = await knex(TABLE_NAME).where({ userId, tutorialId });
  if (userSavedTutorials.length) {
    return _toDomain(userSavedTutorials[0]);
  }
  const savedUserSavedTutorials = await knex(TABLE_NAME).insert({ userId, tutorialId, skillId }).returning('*');
  return _toDomain(savedUserSavedTutorials[0]);
};

const find = async function ({ userId }) {
  const userSavedTutorials = await knex(TABLE_NAME).where({ userId }).orderBy('createdAt', 'desc');
  return userSavedTutorials.map(_toDomain);
};

const removeFromUser = async function (userSavedTutorial) {
  return knex(TABLE_NAME).where(userSavedTutorial).delete();
};

export { addTutorial, find, removeFromUser };

function _toDomain(userSavedTutorial) {
  return new UserSavedTutorial({
    id: userSavedTutorial.id,
    tutorialId: userSavedTutorial.tutorialId,
    userId: userSavedTutorial.userId,
    skillId: userSavedTutorial.skillId,
    createdAt: userSavedTutorial.createdAt,
  });
}
