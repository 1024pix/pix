import { SmartRandomSkill } from '../../../../../src/evaluation/domain/models/SmartRandomSkill.js';

export const buildSmartRandomSkill = function ({ id = 'skillABC123', name = '@fruits10', difficulty = 10 } = {}) {
  return new SmartRandomSkill({
    id,
    name,
    difficulty,
  });
};
