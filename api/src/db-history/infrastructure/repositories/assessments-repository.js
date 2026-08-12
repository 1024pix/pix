import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export const getAssessmentIdsByAssessmentTypeAndDateAndState = async ({
  targetTypes,
  targetDate,
  targetState,
  pageSize = 10,
  fromId = 0,
}) => {
  const knexConn = DomainTransaction.getConnection();
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return knexConn('assessments')
    .pluck('id')
    .whereIn('assessments.type', targetTypes)
    .andWhere('assessments.state', targetState)
    .andWhere('assessments.id', '>', fromId)
    .andWhere('assessments.updatedAt', '>=', new Date(targetDate))
    .andWhere('assessments.updatedAt', '<', nextDay)
    .orderBy('assessments.id', 'asc')
    .limit(pageSize);
};
