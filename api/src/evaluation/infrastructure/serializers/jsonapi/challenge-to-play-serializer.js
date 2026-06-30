import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const config = {
  attributes: [
    'type',
    'instruction',
    'proposals',
    'timer',
    'illustrationUrl',
    'attachments',
    'competence',
    'embedUrl',
    'embedTitle',
    'embedHeight',
    'webComponentTagName',
    'webComponentProps',
    'illustrationAlt',
    'format',
    'autoReply',
    'alternativeInstruction',
    'focused',
    'shuffled',
    'locales',
  ],
  transform: (challenge) => {
    const data = {
      id: challenge.id,
      type: challenge.type,
      instruction: challenge.instruction,
      proposals: challenge.proposals,
      timer: challenge.timer,
      illustrationUrl: challenge.illustrationUrl,
      attachments: challenge.attachments,
      competence: challenge.competenceId || 'N/A',
      embedUrl: challenge.embedUrl,
      embedTitle: challenge.embedTitle,
      embedHeight: challenge.embedHeight,
      webComponentTagName: challenge.webComponentTagName,
      webComponentProps: challenge.webComponentProps,
      illustrationAlt: challenge.illustrationAlt,
      format: challenge.format,
      autoReply: challenge.autoReply,
      alternativeInstruction: challenge.alternativeInstruction,
      focused: challenge.focused,
      shuffled: challenge.shuffled,
      locales: challenge.locales,
    };

    return Object.fromEntries(Object.entries(data).filter(([_, value]) => value != null));
  },
};

const serialize = function (challenges) {
  return new Serializer('challenge', config).serialize(challenges);
};

export const challengeToPlaySerializer = { config, serialize };
