const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

const attributes = [
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
];

function transform(record) {
  const challenge = _.pickBy(record, (value) => !_.isUndefined(value));

  challenge.competence = challenge.competenceId || 'N/A';

  return challenge;
}

module.exports = {
  attributes,
  transform,
  serialize(challenges) {
    return new Serializer('challenge', {
      attributes,
      transform,
    }).serialize(challenges);
  },
};
