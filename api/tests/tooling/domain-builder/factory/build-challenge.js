const Challenge = require('../../../../lib/domain/models/Challenge');
const Validator = require('../../../../lib/domain/models/Validator');
const buildSkill = require('./build-skill');

module.exports = function buildChallenge({
  id = 'recCHAL1',
  // attributes
  attachments = ['URL pièce jointe'],
  embedHeight,
  embedTitle,
  embedUrl,
  format = 'petit',
  illustrationUrl = "Une URL vers l'illustration",
  illustrationAlt = "Le texte de l'illustration",
  instruction = 'Des instructions',
  alternativeInstruction = 'Des instructions alternatives',
  proposals = 'Une proposition',
  status = 'validé',
  timer,
  type = Challenge.Type.QCM,
  locales = ['fr'],
  autoReply = false,
  discriminant = 1,
  difficulty = 0,
  successProbabilityThreshold,
  responsive = 'Smartphone/Tablette',
  focused = false,
  shuffled = false,
  // includes
  answer,
  validator = new Validator(),
  skill = buildSkill(),
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
    discriminant,
    difficulty,
    successProbabilityThreshold,
    alternativeInstruction,
    responsive,
    focused,
    // includes
    answer,
    validator,
    skill,
    // references
    competenceId,
    illustrationAlt,
    shuffled,
  });
};
