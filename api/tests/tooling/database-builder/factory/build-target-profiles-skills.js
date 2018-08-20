const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildTargetProfileSkills({
  id = faker.random.number(),
  targetProfileId = faker.random.number(),
  skillId = 'rec' + faker.random.word()
} = {}) {

  const values = {
    id, targetProfileId, skillId
  };

  databaseBuffer.pushInsertable({
    tableName: 'target-profiles_skills',
    values,
  });

  return values;
};

