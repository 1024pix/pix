import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export const deleteAnswersByIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('answers').delete().whereIn('id', ids);
};

export const selectAnswerIdsByAssessmentIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn.select('id').from('answers').whereIn('answers.assessmentId', ids);
};

export const selectAnswersByIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn.select('*').from('answers').whereIn('answers.id', ids);
};
