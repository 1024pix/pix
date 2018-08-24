const faker = require('faker');
const Challenge = require('../../../lib/domain/models/Challenge');
const Validator = require('../../../lib/domain/models/Validator');
const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildChallenge({
  id = faker.random.uuid(),
  // attributes
  answer,
  attachments,
  competence,
  embedHeight,
  embedTitle,
  embedUrl,
  illustrationUrl,
  instruction,
  proposals,
  status = 'validé',
  timer,
  type = 'QCM',
  // includes
  validator = new Validator(),
  // references
  skills = buildSkillCollection(),

} = {}) {
  return new Challenge({
    id,
    // attributes
    answer,
    attachments,
    competence,
    embedHeight,
    embedTitle,
    embedUrl,
    illustrationUrl,
    instruction,
    proposals,
    status,
    timer,
    type,
    // includes
    validator,
    // references
    skills,
  });
};
