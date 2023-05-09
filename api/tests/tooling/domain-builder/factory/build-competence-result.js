import { CompetenceResult } from '../../../../lib/domain/models/CompetenceResult.js';

const buildCompetenceResult = function ({
  id = 1,
  name = 'name',
  index = '1.1',
  areaColor = 'jaffa',
  areaName,
  totalSkillsCount = 10,
  testedSkillsCount = 8,
  validatedSkillsCount = 5,
} = {}) {
  return new CompetenceResult({
    id,
    name,
    index,
    areaColor,
    areaName,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
  });
};

export { buildCompetenceResult };
