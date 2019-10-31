const faker = require('faker');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Validator = require('../../../../lib/domain/models/Validator');
const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildChallenge(
  {
    id = faker.random.uuid(),
    // attributes
    attachments,
    embedHeight,
    embedTitle,
    embedUrl,
    format,
    illustrationUrl,
    instruction,
    proposals,
    status = 'validé',
    timer,
    type = Challenge.Type.QCM,
    // includes
    answer,
    validator = new Validator(),
    skills = buildSkillCollection(),
    // references
    competenceId = faker.random.uuid(),
  } = {}) {
  return new Challenge({
    id,
    // attributes
    attachments,
    embedHeight,
    embedTitle,
    embedUrl,
    format,
    illustrationUrl,
    instruction,
    proposals,
    status,
    timer,
    type,
    // includes
    answer,
    validator,
    skills,
    // references
    competenceId,
  });
};
