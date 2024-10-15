import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  CertificationCompanionLiveAlert,
  CertificationCompanionLiveAlertStatus,
} from '../../../shared/domain/models/CertificationCompanionLiveAlert.js';

/**
 * @typedef {import('../../../evaluation/domain/usecases/index.js').CertificationCompanionAlertRepository} CertificationCompanionAlertRepository
 */

export const createCompanionAlert = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.assessmentId
   * @param {CertificationCompanionAlertRepository} params.certificationCompanionAlertRepository
   **/
  async function ({ assessmentId, certificationCompanionAlertRepository }) {
    const companionAlert = new CertificationCompanionLiveAlert({
      assessmentId,
      status: CertificationCompanionLiveAlertStatus.ONGOING,
    });
    await certificationCompanionAlertRepository.create(companionAlert);
  },
);
