import { datamartBuffer } from '../datamart-buffer.js';

const buildActiveCalibratedChallenge = function ({ calibrationId, challengeId, alpha = 1.3, delta = 4.1, scope } = {}) {
  const values = {
    calibration_id: calibrationId,
    challenge_id: challengeId,
    alpha,
    delta,
    scope,
  };

  return datamartBuffer.pushInsertable({
    tableName: 'active_calibrated_challenges',
    values,
  });
};

export { buildActiveCalibratedChallenge };
