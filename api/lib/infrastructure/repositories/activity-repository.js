import { knex } from '../../../db/knex-database-connection.js';
import { Activity } from '../../domain/models/Activity.js';
import { NotFoundError } from '../../domain/errors.js';

const save = async function (activity) {
  const [savedAttributes] = await knex('activities').insert(activity).returning('*');
  return new Activity(savedAttributes);
};
const getLastActivity = async function (assessmentId) {
  const activity = await knex('activities').where({ assessmentId }).orderBy('createdAt', 'DESC').first();
  if (!activity) {
    throw new NotFoundError(`No activity found for the assessment: ${assessmentId}`);
  }
  return activity;
};

export { save, getLastActivity };
