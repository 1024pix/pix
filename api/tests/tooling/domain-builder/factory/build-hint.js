import { Hint } from '../../../../lib/shared/domain/models/Hint.js';

const buildHint = function ({ skillName = '@web2', value = 'Pense à regarder les indices' } = {}) {
  return new Hint({
    skillName,
    value,
  });
};

export { buildHint };
