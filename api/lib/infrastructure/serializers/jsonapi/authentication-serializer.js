const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(authentications) {

    return new Serializer('authentication', {
      attributes: ['token', 'user_id', 'password'],
      transform(model) {
        const authentication = Object.assign({}, model.toJSON());
        authentication.user_id = model.user_id.toString();
        authentication.id = model.user_id;
        authentication.password = '';
        return authentication;
      }
    }).serialize(authentications);
  }

};
