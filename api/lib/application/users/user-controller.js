const Boom = require('boom');
const moment = require('moment');
const JSONAPIError = require('jsonapi-serializer').Error;

const errorSerializer = require('../../infrastructure/serializers/jsonapi/error-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const userService = require('../../domain/services/user-service');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const profileService = require('../../domain/services/profile-service');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const tokenService = require('../../domain/services/token-service');
const controllerReplies = require('../../infrastructure/controller-replies');
const { ForbiddenError, InfrastructureError } = require('../../infrastructure/errors');

const usecases = require('../../domain/usecases');
const JSONAPI = require('../../interfaces/jsonapi');

const Bookshelf = require('../../infrastructure/bookshelf');

const logger = require('../../infrastructure/logger');
const { BadRequestError } = require('../../infrastructure/errors');
const {
  InvalidTokenError,
  EntityValidationError,
  PasswordResetDemandNotFoundError,
  UserNotAuthorizedToAccessEntity,
} = require('../../domain/errors');

module.exports = {

  save(request, h) {

    const reCaptchaToken = request.payload.data.attributes['recaptcha-token'];
    const user = userSerializer.deserialize(request.payload);

    return usecases.createUser({
      user,
      reCaptchaToken,
    })
      .then((savedUser) => {
        return h.response(userSerializer.serialize(savedUser)).code(201);
      })
      .catch((error) => {

        if (error instanceof EntityValidationError) {
          return h.response(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }

        logger.error(error);
        return h.response(JSONAPI.internalError('Une erreur est survenue lors de la création de l’utilisateur')).code(500);
      });
  },

  getUser(request, h) {
    const requestedUserId = parseInt(request.params.id, 10);
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserWithMemberships({ authenticatedUserId, requestedUserId })
      .then(userSerializer.serialize)
      .catch((err) => {

        if (err instanceof UserNotAuthorizedToAccessEntity) {
          const jsonAPIError = new JSONAPIError({
            code: '403',
            title: 'Forbidden Access',
            detail: 'Vous n’avez pas accès à cet utilisateur',
          });
          return h.response(jsonAPIError).code(403);
        }

        logger.error(err);
        return h.response(JSONAPI.internalError('Une erreur est survenue lors de la récupération de l’utilisateur')).code(500);
      });
  },

  // FIXME: Pas de tests ?!
  getAuthenticatedUserProfile(request, h) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    return userRepository.findUserById(userId)
      .then((foundUser) => {
        return profileService.getByUserId(foundUser.id);
      })
      .then((buildedProfile) => {
        return h.response(profileSerializer.serialize(buildedProfile)).code(201);
      })
      .catch((err) => {

        if (err instanceof InvalidTokenError) {
          return _replyErrorWithMessage(h, 'Le token n’est pas valide', 401);
        }

        if (err instanceof Bookshelf.Model.NotFoundError) {
          return _replyErrorWithMessage(h, 'Cet utilisateur est introuvable', 404);
        }

        logger.error(err);

        return _replyErrorWithMessage(h, 'Une erreur est survenue lors de l’authentification de l’utilisateur', 500);
      });
  },

  updateUser(request, h) {
    const userId = request.params.id;

    return Promise.resolve(request.payload)
      .then(userSerializer.deserialize)
      .then((user) => {
        if (user.password) {
          return usecases.updateUserPassword({
            userId,
            password: user.password
          });
        }
        if (user.pixOrgaTermsOfServiceAccepted) {
          return usecases.acceptPixOrgaTermsOfService({
            userId
          });
        }
        if (user.pixCertifTermsOfServiceAccepted) {
          return usecases.acceptPixCertifTermsOfService({
            userId
          });
        }
        return Promise.reject(new BadRequestError());
      })
      .then(() => h.response().code(204))
      .catch((err) => {
        if (err instanceof PasswordResetDemandNotFoundError) {
          return h.response(validationErrorSerializer.serialize(err.getErrorMessage())).code(404);
        }

        if (err instanceof BadRequestError) {
          return h.response(errorSerializer.serialize(err)).code(err.code);
        }

        return h.response(JSONAPI.internalError('Une erreur interne est survenue.')).code(500);
      });
  },

  getProfileToCertify(request) {
    const userId = request.params.id;
    const currentDate = moment().toISOString();

    return userService.getProfileToCertify(userId, currentDate)
      .catch((err) => {
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },

  getMemberships(request, h) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserWithMemberships({ authenticatedUserId, requestedUserId })
      .then((user) => membershipSerializer.serialize(user.memberships))
      .catch((error) => {
        const mappedError = _mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  getCertificationCenterMemberships(request, h) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserWithCertificationCenterMemberships({ authenticatedUserId, requestedUserId })
      .then((user) => certificationCenterMembershipSerializer.serialize(user.certificationCenterMemberships))
      .catch((error) => {
        const mappedError = _mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  },

  find(request) {
    const filters = {
      firstName: request.query['firstName'],
      lastName: request.query['lastName'],
      email: request.query['email']
    };
    const pagination = {
      page: request.query['page'] ? request.query['page'] : 1,
      pageSize: request.query['pageSize'] ? request.query['pageSize'] : 10,
    };

    return usecases.findUsers({ filters, pagination })
      .then((searchResultList) => {
        const meta = {
          page: searchResultList.page,
          pageSize: searchResultList.pageSize,
          itemsCount: searchResultList.totalResults,
          pagesCount: searchResultList.pagesCount,
        };
        return userSerializer.serialize(searchResultList.paginatedResults, meta);
      });
  },

  getCampaignParticipations(request, h) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const requestedUserId = request.params.id;

    return usecases.getUserCampaignParticipations({ authenticatedUserId, requestedUserId })
      .then(campaignParticipationSerializer.serialize)
      .then(controllerReplies(h).ok)
      .catch((error) => {
        const mappedError = _mapToInfrastructureErrors(error);
        return controllerReplies(h).error(mappedError);
      });
  }
};

// TODO refacto, extract and simplify
const _replyErrorWithMessage = function(h, errorMessage, statusCode) {
  return h.response(validationErrorSerializer.serialize(_handleWhenInvalidAuthorization(errorMessage))).code(statusCode);
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}

function _mapToInfrastructureErrors(error) {

  if (error instanceof UserNotAuthorizedToAccessEntity) {
    return new ForbiddenError(error.message);
  }

  logger.error(error);
  return new InfrastructureError('Une erreur est survenue lors de la récupération des campagnes de l’utilisateur');
}
