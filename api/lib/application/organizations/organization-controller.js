const userRepository = require('../../infrastructure/repositories/user-repository');

const organisationRepository = require('../../infrastructure/repositories/organization-repository');
const snapshotRepository = require('../../infrastructure/repositories/snapshot-repository');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const snapshotSerializer = require('../../infrastructure/serializers/jsonapi/snapshot-serializer');
const organizationService = require('../../domain/services/organization-service');
const bookshelfUtils = require('../../../lib/infrastructure/utils/bookshelf-utils');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const snapshotsCsvConverter = require('../../infrastructure/converter/snapshots-csv-converter');

const _ = require('lodash');
const logger = require('../../infrastructure/logger');

const { AlreadyRegisteredEmailError } = require('../../domain/errors');
const exportCsvFileName = 'Pix - Export donnees partagees.csv';

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
      })
      .then(_generateUniqueOrganizationCode)
      .then((code) => {
        organization.set('code', code);
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
  },

  search: (request, reply) => {

    const params = _extractFilters(request);

    return organisationRepository
      .findBy(params)
      .then((organizations) => {

        reply(organizationSerializer.serializeArray(organizations.models));
      })
      .catch(err => {
        logger.error(err);
        reply().code(500);
      });
  },

  getSharedProfiles: (request, reply) => {
    return _extractSnapshotsForOrganization(request.params.id)
      .then((jsonSnapshots) => snapshotSerializer.serialize(jsonSnapshots))
      .then((serializedSnapshots) => reply(serializedSnapshots).code(200))
      .catch((err) => {
        logger.error(err);
        return reply(validationErrorSerializer.serialize(
          _buildErrorMessage('une erreur est survenue lors de la récupération des profils')
        )).code(500);
      });
  },

  exportedSharedSnapshots: (request, reply) => {
    return _extractSnapshotsForOrganization(request.params.id)
      .then((jsonSnapshots) => {
        return snapshotsCsvConverter.convertJsonToCsv(jsonSnapshots);
      })
      .then((snapshotsTextCsv) => reply(snapshotsTextCsv)
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', `attachment; filename=${exportCsvFileName}`)
      )
      .catch((err) => {
        logger.error(err);
        return reply(validationErrorSerializer.serialize(
          _buildErrorMessage('une erreur est survenue lors de la récupération des profils')
        )).code(500);
      });
  }
};

function _extractSnapshotsForOrganization(organizationId) {
  return snapshotRepository
    .getSnapshotsByOrganizationId(organizationId)
    .then((snapshots) => bookshelfUtils.mergeModelWithRelationship(snapshots, 'user'))
    .then((snapshotsWithRelatedUsers) => {
      return snapshotsWithRelatedUsers.map((snapshot) => snapshot.toJSON());
    });
}

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

function _generateUniqueOrganizationCode() {
  const code = organizationService.generateOrganizationCode();

  return organisationRepository.isCodeAvailable(code)
    .then((code) => {
      return code;
    })
    .catch(_generateUniqueOrganizationCode);
}

function _extractFilters(request) {
  return _.reduce(request.query, (result, queryFilterValue, queryFilterKey) => {
    const field = queryFilterKey.match(/filter\[([a-z]*)]/)[1];
    if (field) {
      result[field] = queryFilterValue;
    }
    return result;
  }, {});
}

function _buildErrorMessage(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}
