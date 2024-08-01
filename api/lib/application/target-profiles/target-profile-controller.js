import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSummarySerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-summary-serializer.js';
import { evaluationUsecases } from '../../../src/evaluation/domain/usecases/index.js';
import { deserializer as badgeCreationDeserializer } from '../../../src/evaluation/infrastructure/serializers/jsonapi/badge-creation-serializer.js';
import * as badgeSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/badge-serializer.js';
import { usecases as prescriptionTargetProfileUsecases } from '../../../src/prescription/target-profile/domain/usecases/index.js';
import * as targetProfileSerializer from '../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction, withTransaction } from '../../infrastructure/DomainTransaction.js';
import * as targetProfileForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js';
import * as targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';

const findPaginatedFilteredTargetProfileSummariesForAdmin = async function (request) {
  const options = request.query;

  const { models: targetProfileSummaries, meta } = await usecases.findPaginatedFilteredTargetProfileSummariesForAdmin({
    filter: options.filter,
    page: options.page,
  });
  return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries, meta);
};

const getTargetProfileForAdmin = async function (request, h, dependencies = { targetProfileForAdminSerializer }) {
  const targetProfileId = request.params.id;
  const { filter } = request.query;

  const targetProfile = await usecases.getTargetProfileForAdmin({ targetProfileId });
  return dependencies.targetProfileForAdminSerializer.serialize({ targetProfile, filter });
};

const updateTargetProfile = async function (request, h, dependencies = { usecases, targetProfileSerializer }) {
  const targetProfileId = request.params.id;
  const attributesToUpdate = dependencies.targetProfileSerializer.deserialize(request.payload);

  await DomainTransaction.execute(async () => {
    await dependencies.usecases.updateTargetProfile({
      id: targetProfileId,
      attributesToUpdate,
    });
  });

  return h.response().code(204);
};

const createTargetProfile = async function (request) {
  const targetProfileCreationCommand = targetProfileSerializer.deserialize(request.payload);

  const targetProfileId = await DomainTransaction.execute(async () => {
    return usecases.createTargetProfile({
      targetProfileCreationCommand,
    });
  });
  return targetProfileSerializer.serializeId(targetProfileId);
};

const findPaginatedTrainings = async function (request, h, dependencies = { trainingSummarySerializer }) {
  const { page } = request.query;
  const targetProfileId = request.params.id;

  const { trainings, meta } = await devcompUsecases.findPaginatedTargetProfileTrainingSummaries({
    targetProfileId,
    page,
  });
  return dependencies.trainingSummarySerializer.serialize(trainings, meta);
};

const createBadge = async function (request, h) {
  const targetProfileId = request.params.id;
  const badgeCreation = await badgeCreationDeserializer.deserialize(request.payload);

  const createdBadge = await evaluationUsecases.createBadge({ targetProfileId, badgeCreation });

  return h.response(badgeSerializer.serialize(createdBadge)).created();
};

const copyTargetProfile = withTransaction(async (request) => {
  const targetProfileIdToCopy = request.params.targetProfileId;
  const copiedTargetProfileId = await prescriptionTargetProfileUsecases.copyTargetProfile({
    targetProfileId: targetProfileIdToCopy,
  });
  await Promise.all([
    await usecases.copyTargetProfileBadges({
      originTargetProfileId: targetProfileIdToCopy,
      destinationTargetProfileId: copiedTargetProfileId,
    }),
    await usecases.copyTargetProfileStages({
      originTargetProfileId: targetProfileIdToCopy,
      destinationTargetProfileId: copiedTargetProfileId,
    }),
  ]);

  return copiedTargetProfileId;
});

const targetProfileController = {
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  getTargetProfileForAdmin,
  updateTargetProfile,
  createTargetProfile,
  findPaginatedTrainings,
  createBadge,
  copyTargetProfile,
};

export { targetProfileController };
