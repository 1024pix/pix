const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const snapshotRepository = require('../../infrastructure/repositories/snapshot-repository');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const snapshotSerializer = require('../../infrastructure/serializers/jsonapi/snapshot-serializer');
const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const organizationService = require('../../domain/services/organization-service');
const bookshelfUtils = require('../../../lib/infrastructure/utils/bookshelf-utils');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const snapshotsCsvConverter = require('../../infrastructure/converter/snapshots-csv-converter');
const tokenService = require('../../domain/services/token-service');
const usecases = require('../../domain/usecases');
const controllerReplies = require('../../infrastructure/controller-replies');

const logger = require('../../infrastructure/logger');
const { extractFilters } = require('../../infrastructure/utils/query-params-utils');
const JSONAPI = require('../../interfaces/jsonapi');
const { EntityValidationError, NotFoundError } = require('../../domain/errors');
const { InfrastructureError, NotFoundError : InfrastructureNotFoundError } = require('../../infrastructure/errors');

const EXPORT_CSV_FILE_NAME = 'Pix - Export donnees partagees.csv';

module.exports = {

  getOrganizationDetails: (request, reply) => {

    const organizationId = request.params.id;

    return usecases.getOrganizationDetails({ organizationId })
      .then(organizationSerializer.serialize)
      .then(controllerReplies(reply).ok)
      .catch((error) => {
        const mappedError = _mapToInfraError(error);
        return controllerReplies(reply).error(mappedError);
      });
  },

  create: (request, reply) => {

    const { name, type } = request.payload.data.attributes;

    return usecases.createOrganization({ name, type })
      .then(organizationSerializer.serialize)
      .then(controllerReplies(reply).ok)
      .catch((error) => {
        if (error instanceof EntityValidationError) {
          return reply(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }
        const serverError = new InfrastructureError('Une erreur est survenue lors de la création de l’organisation');
        return controllerReplies(reply).error(serverError);
      });
  },

  search: (request, reply) => {
    const userId = request.auth.credentials.userId;
    const filters = extractFilters(request);

    return organizationService.search(userId, filters)
      .then((organizations) => reply(organizationSerializer.serialize(organizations)))
      .catch((err) => {
        logger.error(err);
        reply().code(500);
      });
  },

  getCampaigns(request, reply) {
    const organizationId = request.params.id;
    const tokenForCampaignResults = tokenService.createTokenForCampaignResults(request.auth.credentials.userId);
    return usecases.getOrganizationCampaigns({ organizationId })
      .then((campaigns) => campaignSerializer.serialize(campaigns, tokenForCampaignResults))
      .then(controllerReplies(reply).ok)
      .catch(controllerReplies(reply).error);
  },

  findTargetProfiles(request, reply) {
    const requestedOrganizationId = parseInt(request.params.id);

    return organizationService.findAllTargetProfilesAvailableForOrganization(requestedOrganizationId)
      .then(targetProfileSerializer.serialize)
      .then(controllerReplies(reply).ok)
      .catch(controllerReplies(reply).error);
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
          .header('Content-Disposition', `attachment; filename="${EXPORT_CSV_FILE_NAME}"`);
      })
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

function _buildErrorMessage(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}

function _mapToInfraError(error) {
  if (error instanceof NotFoundError) {
    return new InfrastructureNotFoundError(error.message);
  }
  return error;
}
