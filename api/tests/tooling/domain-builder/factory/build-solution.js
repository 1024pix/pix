import { Solution } from '../../../../src/shared/domain/models/Solution.js';

const buildSolution = function ({
  id = 'recCHAL123',
  type = 'QCM',
  value = '1',
  tEnabled = 0b000,
  qrocBlocksTypes = {},
} = {}) {
  return new Solution({
    id,
    type,
    value,
    tEnabled,
    qrocBlocksTypes,
  });
};

export { buildSolution };
