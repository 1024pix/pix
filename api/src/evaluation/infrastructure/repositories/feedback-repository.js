import { knex } from '../../../../db/knex-database-connection.js';
import { Feedback } from '../../domain/models/Feedback.js';

export const save = async function (feedback) {
  const result = await knex('feedbacks').insert(feedback).returning('*');
  return new Feedback(result[0]);
};
