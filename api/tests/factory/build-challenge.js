const faker = require('faker');
const Challenge = require('../../lib/domain/models/Challenge');
const BuildSkillCollection = require('./build-skill-collection');

module.exports = function BuildChallenge({
  id = faker.random.uuid(),
  skills = BuildSkillCollection(),
  status = 'validé'
} = {}) {
  return Challenge.fromAttributes({ id, skills, status });
};
