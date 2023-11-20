/**
 * @typedef {import ('../../../shared/domain/usecases/index.js').dependencies} deps
 */

import { NotFoundError } from '../../../../../lib/domain/errors.js';

/**
 * @param {Object} params
 * @param {deps['certificationChallengeLiveAlertRepository']} params.certificationChallengeLiveAlertRepository
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
