import { IUserSavedTutorial, UserSavedTutorial } from './../../domain/models/UserSavedTutorial';
/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-var-requires */
const { knex } = require('../../../db/knex-database-connection');
const Tutorial = require('../../domain/models/Tutorial');
const UserSavedTutorialWithTutorial = require('../../domain/models/UserSavedTutorialWithTutorial');
const tutorialDatasource = require('../datasources/learning-content/tutorial-datasource');
const { fetchPage } = require('../utils/knex-utils');

const TABLE_NAME = 'user-saved-tutorials';

export async function addTutorial({ userId, tutorialId, skillId }: Omit<IUserSavedTutorial, 'id'>) {
  const userSavedTutorials = await knex(TABLE_NAME).where({ userId, tutorialId });
  if (userSavedTutorials.length) {
    return _toDomain(userSavedTutorials[0]);
  }
  const savedUserSavedTutorials = await knex(TABLE_NAME).insert({ userId, tutorialId, skillId }).returning('*');
  return _toDomain(savedUserSavedTutorials[0]);
}

export async function find({ userId }: Pick<IUserSavedTutorial, 'userId'>): Promise<IUserSavedTutorial[]> {
  const userSavedTutorials = await knex(TABLE_NAME).where({ userId });
  return userSavedTutorials.map(_toDomain);
}

export async function findPaginated({ userId, page }: Pick<IUserSavedTutorial, 'userId'> & { page: unknown }) {
  const query = knex(TABLE_NAME).where({ userId });
  const { results, pagination } = await fetchPage(query, page);
  const userSavedTutorials = results.map(_toDomain);
  return { models: userSavedTutorials, meta: pagination };
}

// TODO delete when tutorial V2 becomes main version
export async function findWithTutorial({ userId }: Pick<IUserSavedTutorial, 'userId'>) {
  const userSavedTutorials = await knex(TABLE_NAME).where({ userId });
  const tutorials = await tutorialDatasource.findByRecordIds(
    userSavedTutorials.map(({ tutorialId }: any) => tutorialId)
  );
  return tutorials.map((tutorial: { id: unknown }) => {
    const userSavedTutorial = userSavedTutorials.find(({ tutorialId }: any) => tutorialId === tutorial.id);
    return new UserSavedTutorialWithTutorial({
      ...userSavedTutorial,
      tutorial: new Tutorial(tutorial),
    });
  });
}

export async function removeFromUser(userSavedTutorial: IUserSavedTutorial): Promise<void> {
  return knex(TABLE_NAME).where(userSavedTutorial).delete();
}

function _toDomain(userSavedTutorial: IUserSavedTutorial) {
  return new UserSavedTutorial({
    id: userSavedTutorial.id,
    tutorialId: userSavedTutorial.tutorialId,
    userId: userSavedTutorial.userId,
    skillId: userSavedTutorial.skillId,
  });
}
