import omit from 'lodash/omit.js';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Feedback } from '../../domain/models/Feedback.js';

export const save = async function (feedback) {
  const knexConn = DomainTransaction.getConnection();
  const dataToInsert = omit(feedback, ['id']);

  const result = await knexConn('feedbacks').insert(dataToInsert).returning('*');

  return new Feedback(result[0]);
};
