const JSONAPISerializer = require('./jsonapi-serializer');
const Follower = require('../../../domain/models/data/follower');

class FollowerSerializer extends JSONAPISerializer {

  constructor() {
    super('followers');
  }

  serializeAttributes(model, data) {
    data.attributes.email = model.email;
  }

  deserialize(jsonApi) {
    return new Follower({
      email: jsonApi.data.attributes.email
    });
  }
}

module.exports = new FollowerSerializer();
