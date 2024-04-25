import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Activity } from '../../domain/models/Activity.js';
import { ActivityNotFoundError } from '../../domain/school-errors.js';

const save = async function (activity, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  const [savedAttributes] = await knexConnection('activities').insert(activity).returning('*');
  return new Activity(savedAttributes);
};

const updateStatus = async function ({ activityId, status }, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  const [updatedActivity] = await knexConnection('activities')
    .update({ status })
    .where('id', activityId)
    .returning('*');
  if (!updatedActivity) {
    throw new ActivityNotFoundError(`There is no activity corresponding to the id: ${activityId}`);
  }
  return new Activity(updatedActivity);
};

const getLastActivity = async function (assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  const activity = await knexConnection('activities').where({ assessmentId }).orderBy('createdAt', 'DESC').first();
  if (!activity) {
    throw new ActivityNotFoundError(`No activity found for the assessment: ${assessmentId}`);
  }
  return new Activity(activity);
};

const getAllByAssessmentId = async function (assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  const dbActivities = await knexConnection('activities').where({ assessmentId }).orderBy('createdAt', 'DESC');

  return dbActivities.map((activity) => new Activity(activity));
};

export { getAllByAssessmentId, getLastActivity, save, updateStatus };
