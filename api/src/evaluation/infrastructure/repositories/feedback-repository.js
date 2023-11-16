import omit from 'lodash/omit.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { Feedback } from '../../domain/models/Feedback.js';

export const save = async function (feedback) {
  const dataToInsert = omit(feedback, ['id']);

  const result = await knex('feedbacks').insert(dataToInsert).returning('*');

  return new Feedback(result[0]);
};
