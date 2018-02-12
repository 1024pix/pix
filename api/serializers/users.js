const { Serializer, Deserializer } = require('jsonapi-serializer');

module.exports = {

  serialize(users) {
    const serializer = new Serializer('users', {
      attributes: ['firstName', 'lastName', 'email']
    });
    return serializer.serialize(users);
  },

  deserialize(jsonapi) {
    const deserializer = new Deserializer();
    return deserializer.deserialize(jsonapi);
  }

};
