import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

export const clearCompanionAlert = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.sessionId
   * @param {number} params.userId
   * @param {import('./index.js').CertificationCompanionAlertRepository} params.certificationCompanionAlertRepository
   */
  async function clearCompanionAlert({ sessionId, userId, certificationCompanionAlertRepository }) {
    const alert = await certificationCompanionAlertRepository.getOngoingAlert({ sessionId, userId });
    if (!alert) return;

    alert.clear();

    await certificationCompanionAlertRepository.update(alert);
  },
);
