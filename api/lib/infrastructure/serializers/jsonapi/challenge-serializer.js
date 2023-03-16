import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import _ from 'lodash';

const serialize = function (challenges) {
  return new Serializer('challenge', {
    attributes: [
      'type',
      'instruction',
      'competence',
      'proposals',
      'timer',
      'illustrationUrl',
      'attachments',
      'competence',
      'embedUrl',
      'embedTitle',
      'embedHeight',
      'illustrationAlt',
      'format',
      'autoReply',
      'alternativeInstruction',
      'focused',
      'shuffled',
    ],
    transform: (record) => {
      const challenge = _.pickBy(record, (value) => !_.isUndefined(value));

      challenge.competence = challenge.competenceId || 'N/A';

      return challenge;
    },
  }).serialize(challenges);
};

export { serialize };
