const faker = require('faker');
const TargetProfile = require('../../../lib/domain/models/TargetProfile');
const buildSkill = require('./build-skill');

module.exports = function buildTargetProfile({
  id = faker.random.number(),
  name = faker.random.words(),
  isPublic = faker.random.boolean(),
  skills = [buildSkill()],
  organizationId = faker.random.number()
} = {}) {
  return new TargetProfile({
    id,
    name,
    isPublic,
    skills,
    organizationId
  });
};
