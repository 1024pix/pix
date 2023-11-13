/**
 * @typedef {import ('../../../session//infrastructure/repositories/certification-challenge-live-alert-repository.js')} certificationChallengeLiveAlertRepository
 */

import { NotFoundError } from '../../../../../lib/domain/errors.js';

/**
 * @param {Object} deps
 * @param {certificationChallengeLiveAlertRepository} deps.certificationChallengeLiveAlertRepository
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
