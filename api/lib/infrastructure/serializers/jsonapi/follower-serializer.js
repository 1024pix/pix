const { Serializer } = require('jsonapi-serializer');
const Follower = require('../../data/follower');

module.exports = {

  serialize(followers) {
    return new Serializer('follower', {
      attributes: ['email'],
      transform: (model) => model.toJSON()
    }).serialize(followers);
  },

  deserialize(jsonApi) {
    return new Follower({
      email: jsonApi.data.attributes.email
    });
  }

};
