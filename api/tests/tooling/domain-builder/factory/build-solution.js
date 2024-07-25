import { Solution } from '../../../../src/shared/domain/models/Solution.js';

const buildSolution = function ({
  id = 'recCHAL123',
  type = 'QCM',
  value = '1',
  isT1Enabled = false,
  isT2Enabled = false,
  isT3Enabled = false,
} = {}) {
  return new Solution({
    id,
    type,
    value,
    isT1Enabled,
    isT2Enabled,
    isT3Enabled,
  });
};

export { buildSolution };
