const userRepository = require('../../infrastructure/repositories/user-repository');
const organisationRepository = require('../../infrastructure/repositories/organization-repository');

const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

const _ = require('lodash');
const logger = require('../../infrastructure/logger');

const { AlreadyRegisteredEmailError } = require('../../domain/errors');

module.exports = {
  create: (request, reply) => {

    const organization = organizationSerializer.deserialize(request.payload);
    const userRawData = _extractUserInformation(request, organization);

    const userValidationErrors = userRepository.validateData(userRawData);
    const organizationValidationErrors = organization.validationErrors();

    if (userValidationErrors || organizationValidationErrors) {
      const errors = _.merge(userValidationErrors, organizationValidationErrors);
      return reply(validationErrorSerializer.serialize({ data: errors })).code(400);
    }

    return userRepository
      .isEmailAvailable(organization.get('email'))
      .then(() => {
        return userRepository.save(userRawData);
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
        if (err instanceof AlreadyRegisteredEmailError) {
          return reply(validationErrorSerializer.serialize(_buildAlreadyExistingEmailError(organization.get('email')))).code(400);
        }

        logger.error(err);
        reply().code(500);
      });
  }
};

function _buildAlreadyExistingEmailError(email) {
  return {
    data: { email: [`L'adresse ${email} est déjà associée à un utilisateur.`] }
  };
}

function _extractUserInformation(request, organization) {
  return {
    firstName: request.payload.data.attributes['first-name'] || '',
    lastName: request.payload.data.attributes['last-name'] || '',
    email: organization.get('email') || '',
    cgu: true,
    password: request.payload.data.attributes['password'] || ''
  };
}
