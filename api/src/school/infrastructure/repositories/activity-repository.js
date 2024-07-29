import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Activity } from '../../domain/models/Activity.js';
import { ActivityNotFoundError } from '../../domain/school-errors.js';

const save = async function (activity) {
  const knexConn = DomainTransaction.getConnection();
  const [savedAttributes] = await knexConn('activities').insert(activity).returning('*');
  return new Activity(savedAttributes);
};

const updateStatus = async function ({ activityId, status }) {
  const knexConn = DomainTransaction.getConnection();
  const [updatedActivity] = await knexConn('activities').update({ status }).where('id', activityId).returning('*');
  if (!updatedActivity) {
    throw new ActivityNotFoundError(`There is no activity corresponding to the id: ${activityId}`);
  }
  return new Activity(updatedActivity);
};

const getLastActivity = async function (assessmentId) {
  const knexConn = DomainTransaction.getConnection();
  const activity = await knexConn('activities').where({ assessmentId }).orderBy('createdAt', 'DESC').first();
  if (!activity) {
    throw new ActivityNotFoundError(`No activity found for the assessment: ${assessmentId}`);
  }
  return new Activity(activity);
};

const getAllByAssessmentId = async function (assessmentId) {
  const knexConn = DomainTransaction.getConnection();
  const dbActivities = await knexConn('activities').where({ assessmentId }).orderBy('createdAt', 'DESC');

  return dbActivities.map((activity) => new Activity(activity));
};

export { getAllByAssessmentId, getLastActivity, save, updateStatus };
