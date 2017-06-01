
const JSONAPISerializer = require('./jsonapi-serializer');
const Login = require('../../../domain/models/data/login');

class LoginSerializer extends JSONAPISerializer {

  constructor() {
    super('login');
  }

  serializeAttributes(model, data) {
    data.attributes.user_id = model.user_id;
    data.attributes.token = model.token;
  }
}

module.exports = new LoginSerializer();
