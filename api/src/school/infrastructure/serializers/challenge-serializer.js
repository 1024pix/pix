import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (challenges) {
  return new Serializer('challenge', {
    attributes: [
      'type',
      'instructions',
      'proposals',
      'illustrationUrl',
      'embedUrl',
      'embedTitle',
      'embedHeight',
      'webComponentTagName',
      'webComponentProps',
      'illustrationAlt',
      'format',
      'autoReply',
      'shuffled',
      'hasEmbedInternalValidation',
      'noValidationNeeded',
    ],
    transform: (challengeToPlay) => {
      return {
        id: challengeToPlay.id,
        type: challengeToPlay.type,
        proposals: challengeToPlay.proposals,
        illustrationUrl: challengeToPlay.illustrationUrl,
        embedUrl: challengeToPlay.embedUrl,
        embedTitle: challengeToPlay.embedTitle,
        embedHeight: challengeToPlay.embedHeight,
        webComponentTagName: challengeToPlay.webComponentTagName,
        webComponentProps: challengeToPlay.webComponentProps,
        illustrationAlt: challengeToPlay.illustrationAlt,
        format: challengeToPlay.format,
        autoReply: challengeToPlay.autoReply,
        shuffled: challengeToPlay.shuffled,
        hasEmbedInternalValidation: challengeToPlay.hasEmbedInternalValidation,
        noValidationNeeded: challengeToPlay.noValidationNeeded,
        instructions: challengeToPlay.instruction?.split('***'),
      };
    },
  }).serialize(challenges);
};

export const challengeSerializer = { serialize };
