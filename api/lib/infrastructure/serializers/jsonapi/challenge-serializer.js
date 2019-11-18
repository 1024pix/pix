const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

module.exports = {

  serialize(challenges) {
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
      ],
      transform: (record) => {
        const challenge = _.pickBy(record, (value) => !_.isUndefined(value));

        challenge.competence = challenge.competenceId || 'N/A';

        return challenge;
      },
    }).serialize(challenges);
  },
};
