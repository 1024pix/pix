import { Challenge } from '../../../src/shared/domain/models/index.js';

const buildChallenge = function ({
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
  alpha = 1,
  delta = 0,
  responsive = 'Smartphone/Tablette',
  focusable = false,
  shuffled = false,
  alternativeVersion = undefined,
  // includes
  answer,
  skillId = 'recSK123',
  // references
  competenceId = 'recCOMP1',
} = {}) {
  return {
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
    alpha,
    delta,
    alternativeInstruction,
    responsive,
    focusable,
    // includes
    answer,
    skillId,
    // references
    competenceId,
    illustrationAlt,
    shuffled,
    alternativeVersion,
  };
};

export { buildChallenge };
