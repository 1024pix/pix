import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCertificationCompanionAlertRepository from '../../infrastructure/repositories/certification-companion-alert-repository.js';

export const clearCompanionAlert = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.sessionId
   * @param {number} params.userId
   * @param {import('./index.js').CertificationCompanionAlertRepository} params.certificationCompanionAlertRepository
   */
  async function clearCompanionAlert({
    sessionId,
    userId,
    certificationCompanionAlertRepository = injectedCertificationCompanionAlertRepository,
  } = {}) {
    const alert = await certificationCompanionAlertRepository.getOngoingAlert({ sessionId, userId });
    if (!alert) return;

    alert.clear();

    await certificationCompanionAlertRepository.update(alert);
  },
);
