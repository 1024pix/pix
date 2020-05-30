const CompetenceResult = require('../../../../lib/domain/models/CompetenceResult');

const faker = require('faker');

module.exports = function buildCompetenceResult(
  {
    id = 1,
    name = faker.random.words(),
    index = '1.1',
    areaColor = 'jaffa',
    totalSkillsCount = 10,
    testedSkillsCount = 8,
    validatedSkillsCount = 5,
    badgeId,
  } = {}) {

  return new CompetenceResult({
    id,
    name,
    index,
    areaColor,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    badgeId,
  });

};
