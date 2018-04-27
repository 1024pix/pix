const { Serializer } = require('jsonapi-serializer');
const Organization = require('../../../domain/models/Organization');

module.exports = {

  serialize(organizations) {
    return new Serializer('organizations', {
      attributes: ['name', 'type', 'email', 'code', 'user'],
      user: {
        ref: 'id',
        attributes: ['firstName', 'lastName', 'email'],
        included: true,
      }
    }).serialize(organizations);
  },

  deserialize(json) {
    return new Organization({
      email: json.data.attributes.email,
      type: json.data.attributes.type,
      name: json.data.attributes.name,
    });
  }

};
