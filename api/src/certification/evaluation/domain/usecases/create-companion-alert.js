import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  CertificationCompanionLiveAlert,
  CertificationCompanionLiveAlertStatus,
} from '../../../shared/domain/models/CertificationCompanionLiveAlert.js';
import * as injectedCertificationCompanionAlertRepository from '../../infrastructure/repositories/certification-companion-alert-repository.js';

export const createCompanionAlert = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.assessmentId
   * @param {import('./index.js').CertificationCompanionAlertRepository} params.certificationCompanionAlertRepository
   **/
  async function createCompanionAlert({
    assessmentId,
    certificationCompanionAlertRepository = injectedCertificationCompanionAlertRepository,
  } = {}) {
    const companionAlert = new CertificationCompanionLiveAlert({
      assessmentId,
      status: CertificationCompanionLiveAlertStatus.ONGOING,
    });
    await certificationCompanionAlertRepository.create(companionAlert);
  },
);
