const faker = require('faker');
const buildSkill = require('./build-skill');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({
  id = faker.random.number(),
  name = faker.name.jobTitle(),
  isPublic = faker.random.boolean(),
  skills = [buildSkill()],
  organizationId = faker.random.number(),
  organizationsSharedId = [],
  outdated = false,
} = {}) {
  return new TargetProfile({
    id,
    name,
    isPublic,
    skills,
    organizationId,
    organizationsSharedId,
    outdated,
  });
};
