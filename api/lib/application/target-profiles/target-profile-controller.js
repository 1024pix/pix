import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSummarySerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-summary-serializer.js';
import * as targetProfileSerializer from '../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as targetProfileForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js';

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

const targetProfileController = {
  getTargetProfileForAdmin,
  updateTargetProfile,
  createTargetProfile,
  findPaginatedTrainings,
};

export { targetProfileController };
