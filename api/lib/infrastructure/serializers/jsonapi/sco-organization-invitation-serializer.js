const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(invitation) {
    return new Serializer('sco-organization-invitation', {
      attributes: ['uai', 'lastName', 'firstName'],
    }).serialize(invitation);
  },

};
