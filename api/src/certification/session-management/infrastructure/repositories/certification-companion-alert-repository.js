import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  CertificationCompanionLiveAlert,
  CertificationCompanionLiveAlertStatus,
} from '../../../shared/domain/models/CertificationCompanionLiveAlert.js';
const TABLE_NAME = 'certification-companion-live-alerts';

/**
 *
 * @param {object} params
 * @param {number} params.sessionId
 * @param {number} params.userId
 * @param {object} options
 * @param {import('knex').Knex} options.knex
 */
export async function getOngoingAlert({ sessionId, userId }, { knex = DomainTransaction.getConnection() } = {}) {
  const alert = await knex
    .select(`${TABLE_NAME}.*`)
    .first()
    .from('certification-courses')
    .join('assessments', function () {
      this.on('assessments.userId', '=', 'certification-courses.userId').andOn(
        'assessments.certificationCourseId',
        '=',
        'certification-courses.id',
      );
    })
    .join(TABLE_NAME, function () {
      this.on(`${TABLE_NAME}.assessmentId`, '=', 'assessments.id').andOnVal(
        `${TABLE_NAME}.status`,
        '=',
        CertificationCompanionLiveAlertStatus.ONGOING,
      );
    })
    .where('certification-courses.sessionId', '=', sessionId)
    .andWhere('certification-courses.userId', '=', userId)
    .forUpdate(TABLE_NAME);

  if (!alert) return null;

  return new CertificationCompanionLiveAlert(alert);
}

/**
 * @param {CertificationCompanionLiveAlert}
 * @param {object} options
 * @param {import('knex').Knex} options.knex
 */
export async function update({ id, status }, { knex = DomainTransaction.getConnection() } = {}) {
  await knex(TABLE_NAME)
    .update({
      status,
      updatedAt: knex.fn.now(),
    })
    .where({
      id,
    });
}
