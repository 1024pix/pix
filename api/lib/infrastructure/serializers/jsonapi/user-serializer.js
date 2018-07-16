const { Serializer } = require('jsonapi-serializer');
const User = require('../../../domain/models/User');

module.exports = {

  serialize(users) {
    return new Serializer('user', {
      attributes: ['firstName', 'lastName', 'email', 'cgu', 'organizationsAccesses'],
      organizationsAccesses: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/users/${parent.id}/organizations-accesses`;
          }
        }
      },
      transform: (model) => {
        // FIXME: Used to make it work in both cases
        return (model instanceof User) ? model : model.toJSON();
      }
    }).serialize(users);
  },

  deserialize(json) {
    return new User({
      id: json.data.id,
      firstName: json.data.attributes['first-name'],
      lastName: json.data.attributes['last-name'],
      email: json.data.attributes.email,
      password: json.data.attributes.password,
      cgu: json.data.attributes.cgu
    });
  }

};
