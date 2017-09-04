const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const UserRepository = require('../../../lib/infrastructure/repositories/user-repository');
const OrganizationRepository = require('../../../lib/infrastructure/repositories/organization-repository');
const snapshotSerializer = require('../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const profileSerializer = require('../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const SnapshotService = require('../../../lib/domain/services/snapshot-service');
const profileService = require('../../domain/services/profile-service');
const profileCompletionService = require('../../domain/services/profile-completion-service');
const logger = require('../../../lib/infrastructure/logger');
const { InvalidTokenError, NotFoundError, InvaliOrganizationIdError } = require('../../domain/errors');

function _assertThatOrganizationExists(organizationId) {
  return OrganizationRepository.isOrganizationIdExist(organizationId)
    .then((isOrganizationExist) => {
      if(!isOrganizationExist) {
        throw new InvaliOrganizationIdError();
      }
    });
}

const _replyErrorWithMessage = function(reply, errorMessage, statusCode) {
  reply(validationErrorSerializer.serialize(_handleWhenInvalidAuthorization(errorMessage))).code(statusCode);
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}

function _extractOrganizationId(request) {
  return request.hasOwnProperty('payload') && request.payload.data && request.payload.data.relationships.organization.data.id || '';
}

function _hasAnAtuhorizationHeaders(request) {
  return request && request.hasOwnProperty('headers') && request.headers.hasOwnProperty('authorization');
}

function _replyError(err, reply) {
  if(err instanceof InvalidTokenError) {
    return _replyErrorWithMessage(reply, 'Le token n’est pas valide', 401);
  }

  if(err instanceof NotFoundError) {
    return _replyErrorWithMessage(reply, 'Cet utilisateur est introuvable', 422);
  }

  if(err instanceof InvaliOrganizationIdError) {
    return _replyErrorWithMessage(reply, 'Cette organisation n’existe pas', 422);
  }
  logger.error(err);
  return _replyErrorWithMessage(reply, 'Une erreur est survenue lors de la création de l’instantané', 500);
}

function create(request, reply) {

  if(!_hasAnAtuhorizationHeaders(request)) {
    return _replyErrorWithMessage(reply, 'Le token n’est pas valide', 401);
  }

  const token = request.headers.authorization;
  const organizationId = _extractOrganizationId(request);

  return authorizationToken
    .verify(token)
    .then(UserRepository.findUserById)
    .then((foundUser) => _assertThatOrganizationExists(organizationId).then(() => foundUser))
    .then(({ id }) => profileService.getByUserId(id))
    .then((profile) => profileSerializer.serialize(profile))
    .then((profile) => {
      return profileCompletionService
        .getPercentage(profile)
        .then((completionPercentage) => {
          return { profile, completionPercentage };
        });
    })
    .then(({ profile, completionPercentage }) => SnapshotService.create({ organizationId, completionPercentage, profile }))
    .then((snapshotId) => snapshotSerializer.serialize({ id: snapshotId }))
    .then(snapshotSerialized => reply(snapshotSerialized).code(201))
    .catch((err) => _replyError(err, reply));
}

module.exports = { create };
