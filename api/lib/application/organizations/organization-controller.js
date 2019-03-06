const { PassThrough } = require('stream');

const { EntityValidationError, NotFoundError } = require('../../domain/errors');
const organizationService = require('../../domain/services/organization-service');
const usecases = require('../../domain/usecases');
const controllerReplies = require('../../infrastructure/controller-replies');
const { NotFoundError: InfrastructureNotFoundError } = require('../../infrastructure/errors');
const logger = require('../../infrastructure/logger');
const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const JSONAPI = require('../../interfaces/jsonapi');

const EXPORT_CSV_FILE_NAME = 'Pix - Export donnees partagees.csv';

module.exports = {

  getOrganizationDetails: (request, h) => {
    const organizationId = request.params.id;

    return usecases.getOrganizationDetails({ organizationId })
      .then(organizationSerializer.serialize)
      .catch((error) => {
        const mappedError = _mapToInfraError(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  create: (request, h) => {
    const { name, type } = request.payload.data.attributes;

    return usecases.createOrganization({ name, type })
      .then(organizationSerializer.serialize)
      .catch((error) => {
        if (error instanceof EntityValidationError) {
          return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }
        return controllerReplies(h).error(error);
      });
  },

  updateOrganizationInformation: (request, h) => {
    const id = request.payload.data.id;
    const { name, type, 'logo-url': logoUrl } = request.payload.data.attributes;

    return usecases.updateOrganizationInformation({ id, name, type, logoUrl })
      .then(organizationSerializer.serialize)
      .catch((error) => {
        const mappedError = _mapToInfraError(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  find(request) {
    const filters = {
      name: request.query['name'],
      type: request.query['type'],
      code: request.query['code']
    };
    const pagination = {
      page: request.query['page'] ? request.query['page'] : 1,
      pageSize: request.query['pageSize'] ? request.query['pageSize'] : 10,
    };

    return usecases.findOrganizations({ filters, pagination })
      .then((searchResultList) => {
        const meta = {
          page: searchResultList.page,
          pageSize: searchResultList.pageSize,
          itemsCount: searchResultList.totalResults,
          pagesCount: searchResultList.pagesCount,
        };
        return organizationSerializer.serialize(searchResultList.paginatedResults, meta);
      });
  },

  getCampaigns(request, h) {
    const organizationId = request.params.id;

    return usecases.getOrganizationCampaigns({ organizationId })
      .then((campaigns) => campaignSerializer.serialize(campaigns))
      .catch(controllerReplies(h).error);
  },

  getMemberships(request, h) {
    const organizationId = request.params.id;

    return usecases.getOrganizationMemberships({ organizationId })
      .then(membershipSerializer.serialize)
      .catch(controllerReplies(h).error);
  },

  findTargetProfiles(request, h) {
    const requestedOrganizationId = parseInt(request.params.id);

    return organizationService.findAllTargetProfilesAvailableForOrganization(requestedOrganizationId)
      .then(targetProfileSerializer.serialize)
      .catch(controllerReplies(h).error);
  },

  exportSharedSnapshotsAsCsv: async (request, h) => {
    const organizationId = request.params.id;

    try {
      const stream = new PassThrough();

      stream.headers = {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${EXPORT_CSV_FILE_NAME}"`
      };

      await usecases.writeOrganizationSharedProfilesAsCsvToStream({
        organizationId,
        writableStream: stream
      });

      return stream;
    } catch (err) {
      logger.error(err);
      return h.response(validationErrorSerializer.serialize(
        _buildErrorMessage('une erreur est survenue lors de la récupération des profils')
      )).code(500);
    }
  }
};

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
