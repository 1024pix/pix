/**
 * @typedef {import('../../../shared/domain/usecases/index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 */

import { NotFoundError } from '../../../../../lib/domain/errors.js';

/**
 * @param {Object} params
 * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
 */
export const dismissLiveAlert = async ({ userId, sessionId, certificationChallengeLiveAlertRepository }) => {
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
};
