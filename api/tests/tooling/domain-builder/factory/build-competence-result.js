import CompetenceResult from '../../../../lib/domain/models/CompetenceResult';

export default function buildCompetenceResult({
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
}
