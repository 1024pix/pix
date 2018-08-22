const buildTargetProfile = require('./build-target-profile');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');

module.exports = function buildTargetProfilesSkills({
  id = faker.random.number(),
  targetProfileId = buildTargetProfile().id,
  skillId = `rec${faker.random.uuid()}`,
} = {}) {

  const values = {
    id,
    targetProfileId,
    skillId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'target-profiles_skills',
    values,
  });
  
  return values;
};
