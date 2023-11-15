import { knex } from '../../../../db/knex-database-connection.js';
import { Activity } from '../../domain/models/Activity.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

const save = async function (activity) {
  const [savedAttributes] = await knex('activities').insert(activity).returning('*');
  return new Activity(savedAttributes);
};
const updateStatus = async function ({ activityId, status }) {
  const [updatedActivity] = await knex('activities').update({ status }).where('id', activityId).returning('*');
  if (!updatedActivity) {
    throw new NotFoundError(`There is no activity corresponding to the id: ${activityId}`);
  }
  return updatedActivity;
};
const getLastActivity = async function (assessmentId) {
  const activity = await knex('activities').where({ assessmentId }).orderBy('createdAt', 'DESC').first();
  if (!activity) {
    throw new NotFoundError(`No activity found for the assessment: ${assessmentId}`);
  }
  return activity;
};

const getAllByAssessmentId = async function (assessmentId) {
  return await knex('activities').where({ assessmentId }).orderBy('createdAt', 'DESC');
};

export { save, getLastActivity, updateStatus, getAllByAssessmentId };
