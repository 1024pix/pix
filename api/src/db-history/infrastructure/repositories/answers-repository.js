import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export const getAnswersByAssessmentTypeAndDateAndState = async ({ targetTypes, targetDate, targetState }) => {
  return knex
    .select('answers.*')
    .from('assessments')
    .innerJoin('answers', 'answers.assessmentId', 'assessments.id')
    .whereIn('assessments.type', targetTypes)
    .where('assessments.state', targetState)
    .whereRaw('DATE(assessments."updatedAt") = ?', [targetDate]);
};

export const deleteAnswersByIds = ({ ids }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('answers').delete().whereIn('id', ids);
};
