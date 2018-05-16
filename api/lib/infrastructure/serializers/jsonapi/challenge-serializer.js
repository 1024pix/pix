const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

module.exports = {

  serialize(challenges) {
    return new Serializer('challenge', {
      attributes: ['type', 'instruction', 'competence', 'proposals', 'hasntInternetAllowed', 'timer', 'illustrationUrl', 'attachments', 'competence'],
      transform: (record) => {
        const challenge = _.pickBy(record, (value) => !_.isUndefined(value));

        challenge.competence = challenge.competence || 'N/A';

        return challenge;
      }
    }).serialize(challenges);
  }

};
