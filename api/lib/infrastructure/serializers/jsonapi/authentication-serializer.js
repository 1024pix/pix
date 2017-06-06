const JSONAPISerializer = require('./jsonapi-serializer');

class AuthenticationSerializer extends JSONAPISerializer {

  constructor() {
    super('authentication');
  }

  serializeAttributes(model, data) {
    data.id = model.user_id;
    data.attributes.user_id = model.user_id;
    data.attributes.token = model.token;
  }
}

module.exports = new AuthenticationSerializer();
