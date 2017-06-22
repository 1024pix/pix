const JSONAPISerializer = require('./jsonapi-serializer');

class AuthenticationSerializer extends JSONAPISerializer {

  constructor() {
    super('authentication');
  }

  serializeAttributes(model, data) {
    data.id = model.user_id;
    data.attributes['user-id'] = model.user_id;
    data.attributes.token = model.token;
    data.attributes.password = '';
  }
}

module.exports = new AuthenticationSerializer();
