const { Deserializer } = require('jsonapi-serializer');

module.exports = {

  async deserialize(payload) {
    return new Deserializer()
      .deserialize(payload)
      .then((record) => {
        return {
          newEmail: record['new-email'],
          password: record['password'],
        };
      });
  },
};
