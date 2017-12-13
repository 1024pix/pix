const { Serializer } = require('jsonapi-serializer');
const _ = require('lodash');

module.exports = {

  serialize(challenges) {
    return new Serializer('challenge', {
      attributes: ['type', 'instruction', 'competence', 'proposals', 'hasntInternetAllowed', 'timer', 'illustrationUrl', 'attachments'],
      transform: (record) => {
        const challenge = Object.assign({}, record);
        challenge.competence = _.get(record, 'competence[0]', 'N/A');
        return challenge;
      }
    }).serialize(challenges);
  }

};
