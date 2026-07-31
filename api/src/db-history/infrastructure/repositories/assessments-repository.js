import { knex } from '../../../../db/knex-database-connection.js';

export const getAssessmentIdsByAssessmentTypeAndDateAndState = async ({ targetTypes, targetDate, targetState }) => {
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return knex
    .select('id')
    .from('assessments')
    .whereIn('assessments.type', targetTypes)
    .where('assessments.state', targetState)
    .whereRaw('assessments."updatedAt" >= ? AND assessments."updatedAt" < ?', [new Date(targetDate), nextDay]);
};
