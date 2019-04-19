const faker = require('faker');
const buildTargetProfile = require('./build-target-profile');
const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfilesSkills({
  id = faker.random.number(),
  targetProfileId,
  skillId = `rec${faker.random.uuid()}`,
} = {}) {

  targetProfileId = targetProfileId || buildTargetProfile().id;

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
