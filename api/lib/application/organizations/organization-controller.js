const userRepository = require('../../infrastructure/repositories/user-repository');

const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const snapshotRepository = require('../../infrastructure/repositories/snapshot-repository');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const snapshotSerializer = require('../../infrastructure/serializers/jsonapi/snapshot-serializer');
const organizationService = require('../../domain/services/organization-service');
const bookshelfUtils = require('../../../lib/infrastructure/utils/bookshelf-utils');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const snapshotsCsvConverter = require('../../infrastructure/converter/snapshots-csv-converter');

const _ = require('lodash');
const logger = require('../../infrastructure/logger');

const User = require('../../domain/models/User');

const { AlreadyRegisteredEmailError } = require('../../domain/errors');
const exportCsvFileName = 'Pix - Export donnees partagees.csv';

module.exports = {
  create: (request, reply) => {

    const organization = organizationSerializer.deserialize(request.payload);
    const user = _extractUserInformation(request, organization);

    const userValidationErrors = userRepository.validateData(user);
    const organizationValidationErrors = organization.validationErrors();

    if (userValidationErrors || organizationValidationErrors) {
      const errors = _.merge(userValidationErrors, organizationValidationErrors);
      return reply(validationErrorSerializer.serialize({ data: errors })).code(400);
    }

    return userRepository
      .isEmailAvailable(user.email)
      .then(() => {
        return userRepository.save(user);
      })
      .then((user) => {
        organization.set('userId', user.id);
      })
      .then(_generateUniqueOrganizationCode)
      .then((code) => {
        organization.set('code', code);
        return organizationRepository.saveFromModel(organization);
      })
      .then((organization) => {
        reply(organizationSerializer.serialize(organization));
      })
      .catch((err) => {
        if (err instanceof AlreadyRegisteredEmailError) {
          return reply(validationErrorSerializer.serialize(_buildAlreadyExistingEmailError(user.email))).code(400);
        }

        logger.error(err);
        reply().code(500);
      });
  },

  search: (request, reply) => {

    const params = _extractFilters(request);

    return organizationRepository
      .findBy(params)
      .then(organizations => reply(organizationSerializer.serialize(organizations)))
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

function _buildAlreadyExistingEmailError(email) {
  return {
    data: { email: [`L'adresse ${email} est déjà associée à un utilisateur.`] }
  };
}

function _extractUserInformation(request, organization) {
  return new User({
    firstName: request.payload.data.attributes['first-name'] || '',
    lastName: request.payload.data.attributes['last-name'] || '',
    email: organization.get('email') || '',
    cgu: true,
    password: request.payload.data.attributes['password'] || ''
  });
}

function _generateUniqueOrganizationCode() {
  const code = organizationService.generateOrganizationCode();

  return organizationRepository.isCodeAvailable(code)
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
