const faker = require('faker');
const buildTargetProfile = require('./build-target-profile');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfileSkill({
  id,
  targetProfileId,
  skillId = `rec${faker.random.uuid()}`,
} = {}) {

  targetProfileId = _.isUndefined(targetProfileId) ? buildTargetProfile().id : targetProfileId;

  const values = {
    id,
    targetProfileId,
    skillId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles_skills',
    values,
  });
};
