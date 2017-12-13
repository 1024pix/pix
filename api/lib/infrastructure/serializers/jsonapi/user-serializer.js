const { Serializer } = require('jsonapi-serializer');
const User = require('../../../domain/models/data/user');

module.exports = {

  serialize(users) {
    return new Serializer('user', {
      attributes: ['firstName', 'lastName'],
      transform: (model) => model.toJSON()
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
