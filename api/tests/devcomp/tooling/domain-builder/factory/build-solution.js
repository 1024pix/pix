import { Solution } from '../../../../../src/devcomp/domain/models/Solution.js';

const buildSolution = function ({
  id = 'recCHAL123',
  type = 'QCM',
  value = ['1'],
  tEnabled = 0b0,
} = {}) {
  return new Solution({
    id,
    type,
    value,
    tEnabled,
  });
};

export { buildSolution };
