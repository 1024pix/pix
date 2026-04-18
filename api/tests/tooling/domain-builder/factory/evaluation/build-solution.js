import { Solution } from '../../../../../src/evaluation/domain/models/Solution.js';

export function buildSolution({
  id = 'recCHAL123',
  type = 'QCM',
  value = '1',
  isT1Enabled = false,
  isT2Enabled = false,
  isT3Enabled = false,
  qrocBlocksTypes = {},
} = {}) {
  return new Solution({
    id,
    type,
    value,
    isT1Enabled,
    isT2Enabled,
    isT3Enabled,
    qrocBlocksTypes,
  });
}
