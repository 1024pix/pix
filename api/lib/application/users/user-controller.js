const Boom = require('boom');
const _ = require('../../infrastructure/utils/lodash-utils');

const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

const mailService = require('../../domain/services/mail-service');

module.exports = {

  save(request, reply) {

    if (!_.has(request, 'payload') || !_.has(request, 'payload.data.attributes')) {
      return reply(Boom.badRequest());
    }

    const user = userSerializer.deserialize(request.payload);

    return user
      .save()
      .then((user) => {
        mailService.sendAccountCreationEmail(user.get('email'));
        reply().code(201);
      })
      .catch((err) => {

        if (err.code === 'SQLITE_CONSTRAINT') {
          err = _buildErrorWhenUniquEmail();
        }

        reply(validationErrorSerializer.serialize(err)).code(400);
      });
  }

};

function _buildErrorWhenUniquEmail() {
  return {
    data: {
      email: [ 'Cette adresse electronique est déjà enregistrée.' ]
    }
  };
}

