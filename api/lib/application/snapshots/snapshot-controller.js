const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const organizationRepository = require('../../../lib/infrastructure/repositories/organization-repository');
const snapshotSerializer = require('../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const profileSerializer = require('../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotService = require('../../../lib/domain/services/snapshot-service');
const profileService = require('../../domain/services/profile-service');
const profileCompletionService = require('../../domain/services/profile-completion-service');
const logger = require('../../../lib/infrastructure/logger');
const usecases = require('../../domain/usecases');
const JSONAPIError = require('jsonapi-serializer').Error;
const { extractParameters } = require('../../infrastructure/utils/query-params-utils');
const { InvalidTokenError, NotFoundError, InvaliOrganizationIdError, InvalidSnapshotCode } = require('../../domain/errors');
const MAX_CODE_LENGTH = 255;

function _assertThatOrganizationExists(organizationId) {
  return organizationRepository.isOrganizationIdExist(organizationId)
    .then((isOrganizationExist) => {
      if (!isOrganizationExist) {
        throw new InvaliOrganizationIdError();
      }
    });
}

function _validateSnapshotCode(snapshot) {
  if (snapshot.studentCode.length > MAX_CODE_LENGTH || snapshot.campaignCode.length > MAX_CODE_LENGTH) {
    return Promise.reject(new InvalidSnapshotCode());
  }
  return Promise.resolve();
}

function _hasAnAtuhorizationHeaders(request) {
  return request && request.hasOwnProperty('headers') && request.headers.hasOwnProperty('authorization');
}

function _replyError(err, h) {
  if (err instanceof InvalidTokenError) {
    return h.response(new JSONAPIError({
      code: '401',
      title: 'Unauthorized',
      detail: 'Le token n’est pas valide'
    })).code(401);
  }

  if (err instanceof NotFoundError) {
    return h.response(new JSONAPIError({
      code: '422',
      title: 'Unprocessable entity',
      detail: 'Cet utilisateur est introuvable'
    })).code(422);
  }

  if (err instanceof InvaliOrganizationIdError) {
    return h.response(new JSONAPIError({
      code: '422',
      title: 'Unprocessable entity',
      detail: 'Cette organisation n’existe pas'
    })).code(422);
  }

  if (err instanceof InvalidSnapshotCode) {
    return h.response(new JSONAPIError({
      code: '422',
      title: 'Unprocessable entity',
      detail: 'Les codes de partage du profil sont trop longs'
    })).code(422);
  }

  logger.error(err);
  return h.response(new JSONAPIError({
    code: '500',
    title: 'Internal Server Error',
    detail: 'Une erreur est survenue lors de la création de l’instantané'
  })).code(500);
}

function create(request, h) {

  if (!_hasAnAtuhorizationHeaders(request)) {
    return h.response(new JSONAPIError({
      code: '401',
      title: 'Unauthorized',
      detail: 'Le token n’est pas valide'
    })).code(401);
  }

  const token = request.headers.authorization;
  let user;
  let snapshot;
  let serializedProfile;

  return authorizationToken.verify(token)
    .then((userId) => userRepository.findUserById(userId))
    .then((foundUser) => user = foundUser)
    .then(() => snapshotSerializer.deserialize(request.payload))
    .then((deserializedSnapshot) => (snapshot = deserializedSnapshot))
    .then(() => _validateSnapshotCode(snapshot))
    .then(() => _assertThatOrganizationExists(snapshot.organization.id))
    .then(() => profileService.getByUserId(user.id))
    .then((profile) => profileSerializer.serialize(profile))
    .then((jsonApiProfile) => (serializedProfile = jsonApiProfile))
    .then(() => profileCompletionService.getNumberOfFinishedTests(serializedProfile))
    .then((testsFinished) => snapshot.testsFinished = testsFinished)
    .then(() => snapshotService.create(snapshot, user, serializedProfile))
    .then((snapshotId) => snapshotSerializer.serialize({ id: snapshotId }))
    .then((snapshotSerialized) => h.response(snapshotSerialized).code(201))
    .catch((err) => _replyError(err, h));
}

function find(request) {
  return usecases.findSnapshots({ options: extractParameters(request.query) })
    .then((result) => {
      return snapshotSerializer.serialize(result.models, result.pagination);
    });
}

module.exports = { create, find };
