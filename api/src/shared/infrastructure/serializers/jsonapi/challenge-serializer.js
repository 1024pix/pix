import jsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

const { Serializer } = jsonapiSerializer;

const config = {
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
  transform: (record) => {
    const challenge = _.pickBy(record, (value) => !_.isUndefined(value));

    challenge.competence = challenge.competenceId || 'N/A';

    return challenge;
  },
};

const serialize = function (challenges) {
  return new Serializer('challenge', config).serialize(challenges);
};

export const challengeSerializer = { config, serialize };
