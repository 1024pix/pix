import { SkillSet } from '../../../../lib/shared/domain/models/SkillSet.js';

const buildSkillSet = function ({ id = 1, badgeId = 64, name = 'name', skillIds = ['recABC', 'recDEF'] } = {}) {
  return new SkillSet({
    id,
    badgeId,
    name,
    skillIds,
  });
};

export { buildSkillSet };
