import { ChallengeToPlay } from '../../../../../src/evaluation/domain/models/ChallengeToPlay.js';
import { buildChallenge } from '../learning-content/build-challenge.js';

export const buildChallengeToPlay = function ({
  id = 'foo id',
  instruction = 'foo instruction',
  alternativeInstruction = 'foo alternativeInstruction',
  proposals = 'foo proposals',
  type = buildChallenge.TYPES.QCM,
  shuffled = true,
  illustrationAlt = 'foo illustrationAlt',
  illustrationUrl = 'foo illustrationUrl',
  attachments = ['foo attachment'],
  autoReply = false,
  focused = false,
  format = 'foo format',
  timer = 123,
  embedHeight = 456,
  embedUrl = 'foo embedUrl',
  embedTitle = 'foo embedTitle',
  locales = ['foo locale'],
  competenceId = 'foo competenceId',
  noValidationNeeded = false,
  hasEmbedInternalValidation = false,
  webComponentTagName = 'foo webComponentTagName',
  webComponentProps = { foo: 'bar' },
} = {}) {
  const coreChallenge = buildChallenge({
    id,
    instruction,
    alternativeInstruction,
    proposals,
    type,
    shuffled,
    illustrationAlt,
    illustrationUrl,
    attachments,
    autoReply,
    focusable: focused,
    format,
    timer,
    embedHeight,
    embedUrl,
    embedTitle,
    locales,
    competenceId,
    noValidationNeeded,
    hasEmbedInternalValidation,
  });
  return new ChallengeToPlay(coreChallenge, webComponentTagName, webComponentProps);
};

buildChallengeToPlay.TYPES = buildChallenge.TYPES;
