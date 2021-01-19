const faker = require('faker');
const buildSkill = require('./build-skill');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({
  id = faker.random.number(),
  name = faker.name.jobTitle(),
  imageUrl = faker.internet.url(),
  isPublic = faker.random.boolean(),
  isSimplifiedAccess = false,
  skills = [buildSkill()],
  ownerOrganizationId = faker.random.number(),
  outdated = false,
  stages = [],
  badges,
} = {}) {
  return new TargetProfile({
    id,
    name,
    imageUrl,
    isPublic,
    isSimplifiedAccess,
    skills,
    ownerOrganizationId,
    outdated,
    stages,
    badges,
  });
};
