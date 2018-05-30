const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(authentications) {

    return new Serializer('authentication', {
      attributes: ['token', 'user_id', 'password'],
      transform(model) {
        const authentication = Object.assign({}, model.toJSON());
        authentication.user_id = model.userId.toString();
        authentication.id = model.userId;
        authentication.password = '';
        return authentication;
      }
    }).serialize(authentications);
  }

};
