import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export const getAnswersByAssessmentTypeAndDateAndState = async ({ targetTypes, targetDate, targetState }) => {
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return knex
    .select('answers.*')
    .from('assessments')
    .innerJoin('answers', 'answers.assessmentId', 'assessments.id')
    .whereIn('assessments.type', targetTypes)
    .where('assessments.state', targetState)
    .whereRaw('assessments."updatedAt" >= ? AND assessments."updatedAt" < ?', [new Date(targetDate), nextDay]);
};

export const deleteAnswersByIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('answers').delete().whereIn('id', ids);
};
