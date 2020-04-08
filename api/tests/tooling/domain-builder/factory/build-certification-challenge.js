const faker = require('faker');
const buildSkill = require('./build-skill');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');

module.exports = function buildCertificationChallenge({
  id = faker.random.number(),
  challengeId = `rec${faker.random.uuid()}`,
  competenceId = `rec${faker.random.uuid()}`,
  courseId = faker.random.number(),
  associatedSkill = buildSkill().name,
} = {}) {

  return new CertificationChallenge({
    id,
    challengeId,
    competenceId,
    courseId,
    associatedSkill,
  });
};
