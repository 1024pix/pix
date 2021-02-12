const CompetenceResult = require('../../../../lib/domain/models/CompetenceResult');

module.exports = function buildCompetenceResult({
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
