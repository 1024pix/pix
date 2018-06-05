const faker = require('faker');
const Challenge = require('../../lib/domain/models/Challenge');
const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildChallenge({
  id = faker.random.uuid(),
  skills = buildSkillCollection(),
  status = 'validé'
} = {}) {
  return Challenge.fromAttributes({ id, skills, status });
};
