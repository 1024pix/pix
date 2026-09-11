/**
 * @typedef {import('../../../shared/infrastructure/repositories/certification-challenge-live-alert-repository.js')} CertificationChallengeLiveAlertRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 */
export async function dismissLiveAlert({ userId, sessionId, certificationChallengeLiveAlertRepository }) {
  const certificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId({
      sessionId,
      userId,
    });

  if (!certificationChallengeLiveAlert) {
    throw new NotFoundError('There is no ongoing alert for this user');
  }

  certificationChallengeLiveAlert.dismiss();

  await certificationChallengeLiveAlertRepository.save({
    certificationChallengeLiveAlert,
  });
}
