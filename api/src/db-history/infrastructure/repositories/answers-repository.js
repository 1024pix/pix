import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export const deleteAnswersByIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('answers').delete().whereIn('id', ids);
};

export const selectAnswerIdsByAssessmentIds = ({ ids, fromId = 0, pageSize = 1000 }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .pluck('id')
    .from('answers')
    .whereIn('answers.assessmentId', ids)
    .andWhere('answers.id', '>', fromId)
    .limit(pageSize)
    .orderBy('answers.id', 'asc');
};

export const selectAnswersByIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn.select('*').from('answers').whereIn('answers.id', ids);
};
