const userRepository = require('../../infrastructure/repositories/user-repository');
const organisationRepository = require('../../infrastructure/repositories/organization-repository');

const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

const { NotFoundError } = require('../../domain/errors');

module.exports = {
  create: (request, reply) => {

    const organization = organizationSerializer.deserialize(request.payload);

    const validationErrors = organization.validationErrors();
    if (validationErrors) {
      return reply(validationErrorSerializer.serialize({ data: validationErrors })).code(400);
    }

    return userRepository
      .findByEmail((organization.get('email')))
      .then(() => {
        return Promise.reject(_buildAlreadyExistingEmailError((organization.get('email'))));
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          return userRepository.save({
            firstName: request.payload.data.attributes['first-name'] || '',
            lastName: request.payload.data.attributes['last-name'] || '',
            email: organization.get('email') || '',
            cgu: true,
            password: 'Pix1024#'
          });
        }

        return Promise.reject(err);
      })
      .then((user) => {
        organization.set('userId', user.id);
        organization.user = user;

        return organisationRepository.saveFromModel(organization);
      })
      .then((organization) => {
        reply(organizationSerializer.serialize(organization));
      })
      .catch((err) => {
        reply(validationErrorSerializer.serialize(err)).code(400);
      });
  }
};

function _buildAlreadyExistingEmailError(email) {
  return {
    data: { email: [`L'adresse ${email} est déjà associée à un utilisateur.`] }
  };
}
