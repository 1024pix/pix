const Challenge = require('../../../../lib/domain/models/Challenge');
const Validator = require('../../../../lib/domain/models/Validator');
const buildSkillCollection = require('./build-skill-collection');

module.exports = function buildChallenge({
  id = 'recCHAL1',
  // attributes
  attachments = ['URL pièce jointe'],
  embedHeight,
  embedTitle,
  embedUrl,
  format = 'petit',
  illustrationUrl = 'Une URL vers l\'illustration',
  illustrationAlt = 'Le texte de l\'illustration',
  instruction = 'Des instructions',
  alternativeInstruction = 'Des instructions alternatives',
  proposals = 'Une proposition',
  status = 'validé',
  timer,
  type = Challenge.Type.QCM,
  locales = ['fr'],
  autoReply = false,
  // includes
  answer,
  validator = new Validator(),
  skills = buildSkillCollection(),
  // references
  competenceId = 'recCOMP1',
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
    locales,
    autoReply,
    alternativeInstruction,
    // includes
    answer,
    validator,
    skills,
    // references
    competenceId,
    illustrationAlt,
  });
};
