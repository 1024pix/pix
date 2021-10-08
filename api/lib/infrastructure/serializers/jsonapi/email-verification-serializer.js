const { Deserializer } = require('jsonapi-serializer');

module.exports = {
  deserialize(payload) {
    return new Deserializer().deserialize(payload).then((record) => {
      return {
        newEmail: record['new-email'].toLowerCase(),
        password: record['password'],
      };
    });
  },
};
