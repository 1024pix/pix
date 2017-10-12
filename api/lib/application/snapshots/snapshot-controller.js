const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const organizationRepository = require('../../../lib/infrastructure/repositories/organization-repository');
const snapshotSerializer = require('../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const profileSerializer = require('../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotService = require('../../../lib/domain/services/snapshot-service');
const profileService = require('../../domain/services/profile-service');
const profileCompletionService = require('../../domain/services/profile-completion-service');
const logger = require('../../../lib/infrastructure/logger');
const { InvalidTokenError, NotFoundError, InvaliOrganizationIdError } = require('../../domain/errors');

function _assertThatOrganizationExists(organizationId) {
  return organizationRepository.isOrganizationIdExist(organizationId)
    .then((isOrganizationExist) => {
      if (!isOrganizationExist) {
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

function _hasAnAtuhorizationHeaders(request) {
  return request && request.hasOwnProperty('headers') && request.headers.hasOwnProperty('authorization');
}

function _replyError(err, reply) {
  if (err instanceof InvalidTokenError) {
    return _replyErrorWithMessage(reply, 'Le token n’est pas valide', 401);
  }

  if (err instanceof NotFoundError) {
    return _replyErrorWithMessage(reply, 'Cet utilisateur est introuvable', 422);
  }

  if (err instanceof InvaliOrganizationIdError) {
    return _replyErrorWithMessage(reply, 'Cette organisation n’existe pas', 422);
  }
  logger.error(err);
  return _replyErrorWithMessage(reply, 'Une erreur est survenue lors de la création de l’instantané', 500);
}

function create(request, reply) {

  if (!_hasAnAtuhorizationHeaders(request)) {
    return _replyErrorWithMessage(reply, 'Le token n’est pas valide', 401);
  }

  const token = request.headers.authorization;
  let user;
  let snapshot;
  let serializedProfile;

  return authorizationToken.verify(token)
    .then((userId) => userRepository.findUserById(userId))
    .then((foundUser) => user = foundUser)
    .then(() => snapshotSerializer.deserialize(request.payload))
    .then(deserializedSnapshot => (snapshot = deserializedSnapshot))
    .then(() => _assertThatOrganizationExists(snapshot.organization.id))
    .then(() => profileService.getByUserId(user.id))
    .then((profile) => profileSerializer.serialize(profile))
    .then((jsonApiProfile) => (serializedProfile = jsonApiProfile))
    .then(() => profileCompletionService.getPercentage(serializedProfile))
    .then((completionPercentage) => snapshot.completionPercentage = completionPercentage)
    .then(() => snapshotService.create(snapshot, user, serializedProfile))
    .then((snapshotId) => snapshotSerializer.serialize({ id: snapshotId }))
    .then(snapshotSerialized => reply(snapshotSerialized).code(201))
    .catch((err) => _replyError(err, reply));
}

module.exports = { create };
