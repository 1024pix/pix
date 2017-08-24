const JSONAPISerializer = require('jsonapi-serializer').Serializer;

class AuthenticationSerializer {

  serialize(authentication) {

    return new JSONAPISerializer('authentication', {
      attributes: ['token', 'user_id', 'password'],
      transform(record) {
        record.user_id = record.user_id.toString();
        record.id = record.user_id;
        record.password = '';
        return record;
      }
    }).serialize(authentication);
  }
}

module.exports = new AuthenticationSerializer();
