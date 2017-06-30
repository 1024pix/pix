const JSONAPISerializer = require('./jsonapi-serializer');
const User = require('../../../domain/models/data/user');

class UserSerializer extends JSONAPISerializer {

  constructor() {
    super('user');
  }

  serializeAttributes(model, data) {
    data.attributes['first-name'] = model.firstName;
    data.attributes['last-name'] = model.lastName;
  }

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

}

module.exports = new UserSerializer();
