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
      'focused',
      'timer',
      'shuffled',
    ],
    transform: (challenge) => {
      return {
        ...challenge,
        instructions: challenge.instruction?.split('***'),
      };
    },
  }).serialize(challenges);
};

export { serialize };
