const _ = require('lodash');
const JSONAPIError = require('jsonapi-serializer').Error;

const userRepository = require('../../infrastructure/repositories/user-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const snapshotRepository = require('../../infrastructure/repositories/snapshot-repository');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const snapshotSerializer = require('../../infrastructure/serializers/jsonapi/snapshot-serializer');
const organizationService = require('../../domain/services/organization-service');
const encryptionService = require('../../domain/services/encryption-service');
const bookshelfUtils = require('../../../lib/infrastructure/utils/bookshelf-utils');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const snapshotsCsvConverter = require('../../infrastructure/converter/snapshots-csv-converter');
const organizationCreationValidator = require('../../domain/validators/organization-creation-validator');

const logger = require('../../infrastructure/logger');
const User = require('../../domain/models/User');
const Organization = require('../../domain/models/Organization');
const exportCsvFileName = 'Pix - Export donnees partagees.csv';
const { EntityValidationError } = require('../../domain/errors');

module.exports = {

  // TODO extract domain logic into use case, like create user
  create: (request, reply) => {

    const user = _extractUser(request);
    const organization = _extractOrganization(request);

    return organizationCreationValidator.validate(user, organization)
      .then(() => encryptionService.hashPassword(user.password))
      .then((encryptedPassword) => user.password = encryptedPassword)
      .then(() => userRepository.create(user))
      .then((user) => organization.userId = user.id)
      .then(_generateUniqueOrganizationCode)
      .then((code) => organization.code = code)
      .then(() => organizationRepository.create(organization))
      .then((savedOrganization) => organizationSerializer.serialize(savedOrganization))
      .then((serializedOrganization) => reply(serializedOrganization))
      .catch((error) => {

        if (error instanceof EntityValidationError) {
          const serializedErrors = new JSONAPIError(error.invalidAttributes.map(_formatValidationError));
          return reply(serializedErrors).code(422);
        }

        logger.error(error);
        return reply(new JSONAPIError({ status: '500', title: 'Une erreur serveur est survenue.', meta: error })).code(500);
      });
  },

  search: (request, reply) => {
    const userId = request.auth.credentials.userId;
    const filters = _extractFilters(request);

    return organizationService.search(userId, filters)
      .then(organizations => reply(organizationSerializer.serialize(organizations)))
      .catch(err => {
        logger.error(err);
        reply().code(500);
      });
  },

  // TODO extract domain logic into service
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

  exportSharedSnapshotsAsCsv: (request, reply) => {
    const dependencies = {
      organizationRepository,
      competenceRepository,
      snapshotRepository,
      bookshelfUtils,
      snapshotsCsvConverter,
    };
    const organizationId = request.params.id;

    return organizationService.getOrganizationSharedProfilesAsCsv(dependencies, organizationId)
      .then((snapshotsTextCsv) => {
        return reply(snapshotsTextCsv)
          .header('Content-Type', 'text/csv;charset=utf-8')
          .header('Content-Disposition', `attachment; filename=${exportCsvFileName}`);
      }
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

function _extractUser(request) {
  return new User({
    firstName: request.payload.data.attributes['first-name'] || '',
    lastName: request.payload.data.attributes['last-name'] || '',
    email: request.payload.data.attributes['email'] || '',
    password: request.payload.data.attributes['password'] || '',
    cgu: true,
  });
}

function _extractOrganization(request) {
  return new Organization({
    name: request.payload.data.attributes['name'] || '',
    type: request.payload.data.attributes['type'] || '',
    email: request.payload.data.attributes['email'] || '',
  });
}

function _generateUniqueOrganizationCode() {
  const code = organizationService.generateOrganizationCode();
  return organizationRepository.isCodeAvailable(code)
    .then(() => code)
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

// TODO extract this into a common error formatter
function _formatValidationError({ attribute, message }) {
  return {
    source: {
      pointer: `/data/attributes/${ _.kebabCase(attribute) }`,
    },
    title: `Invalid user data attribute "${ attribute }"`,
    detail: message
  };
}
