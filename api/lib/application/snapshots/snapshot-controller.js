const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const organizationRepository = require('../../../lib/infrastructure/repositories/organization-repository');
const snapshotSerializer = require('../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const profileSerializer = require('../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const snapshotService = require('../../../lib/domain/services/snapshot-service');
const profileService = require('../../domain/services/profile-service');
const profileCompletionService = require('../../domain/services/profile-completion-service');
const usecases = require('../../domain/usecases');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const { InvalidOrganizationIdError, InvalidSnapshotCode } = require('../../domain/errors');
const MAX_CODE_LENGTH = 255;

async function _assertThatOrganizationExists(organizationId) {
  const isOrganizationExist = await organizationRepository.isOrganizationIdExist(organizationId);
  if (!isOrganizationExist) {
    throw new InvalidOrganizationIdError();
  }
}

function _validateSnapshotCode(snapshot) {
  if (snapshot.studentCode.length > MAX_CODE_LENGTH || snapshot.campaignCode.length > MAX_CODE_LENGTH) {
    throw new InvalidSnapshotCode();
  }
}

async function _getSnapshot(snapshotPayload) {
  const deserializedSnapshot = await snapshotSerializer.deserialize(snapshotPayload);
  await _validateSnapshotCode(deserializedSnapshot);
  await _assertThatOrganizationExists(deserializedSnapshot.organization.id);

  return deserializedSnapshot;
}

async function create(request, h) {
  const token = request.headers.authorization;
  const userId = await authorizationToken.verify(token);
  const user = await userRepository.findUserById(userId);
  const snapshot = await _getSnapshot(request.payload);
  const profile = await profileService.getByUserId(user.id);
  const serializedProfile = await profileSerializer.serialize(profile);
  const testsFinished = await profileCompletionService.getNumberOfFinishedTests(serializedProfile);
  snapshot.testsFinished = testsFinished;
  const snapshotId = await snapshotService.create(snapshot, user, serializedProfile);
  const serializedSnapshot = await snapshotSerializer.serialize({ id: snapshotId });
  
  return h.response(serializedSnapshot).created();
}

async function find(request) {
  const result = await usecases.findSnapshots({
    options: queryParamsUtils.extractParameters(request.query)
  });

  return snapshotSerializer.serialize(result.models, result.pagination);
}

module.exports = { create, find };
