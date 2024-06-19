import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSummarySerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-summary-serializer.js';
import { evaluationUsecases } from '../../../src/evaluation/domain/usecases/index.js';
import { deserializer as badgeCreationDeserializer } from '../../../src/evaluation/infrastructure/serializers/jsonapi/badge-creation-serializer.js';
import * as badgeSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/badge-serializer.js';
import * as targetProfileSerializer from '../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-serializer.js';
import * as queryParamsUtils from '../../../src/shared/infrastructure/utils/query-params-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as targetProfileForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js';
import * as targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';

const findPaginatedFilteredTargetProfileSummariesForAdmin = async function (request) {
  const options = queryParamsUtils.extractParameters(request.query);

  const { models: targetProfileSummaries, meta } = await usecases.findPaginatedFilteredTargetProfileSummariesForAdmin({
    filter: options.filter,
    page: options.page,
  });
  return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries, meta);
};

const getTargetProfileForAdmin = async function (
  request,
  h,
  dependencies = { targetProfileForAdminSerializer, queryParamsUtils },
) {
  const targetProfileId = request.params.id;
  const { filter } = dependencies.queryParamsUtils.extractParameters(request.query);

  const targetProfile = await usecases.getTargetProfileForAdmin({ targetProfileId });
  return dependencies.targetProfileForAdminSerializer.serialize({ targetProfile, filter });
};

const updateTargetProfile = async function (request, h, dependencies = { usecases, targetProfileSerializer }) {
  const targetProfileId = request.params.id;
  const attributesToUpdate = dependencies.targetProfileSerializer.deserialize(request.payload);

  await DomainTransaction.execute(async (domainTransaction) => {
    await dependencies.usecases.updateTargetProfile({
      id: targetProfileId,
      attributesToUpdate,
      domainTransaction,
    });
  });

  return h.response().code(204);
};

const createTargetProfile = async function (request) {
  const targetProfileCreationCommand = targetProfileSerializer.deserialize(request.payload);

  const targetProfileId = await DomainTransaction.execute(async (domainTransaction) => {
    return usecases.createTargetProfile({
      targetProfileCreationCommand,
      domainTransaction,
    });
  });
  return targetProfileSerializer.serializeId(targetProfileId);
};

const findPaginatedTrainings = async function (
  request,
  h,
  dependencies = { queryParamsUtils, trainingSummarySerializer },
) {
  const { page } = dependencies.queryParamsUtils.extractParameters(request.query);
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

const targetProfileController = {
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  getTargetProfileForAdmin,
  updateTargetProfile,
  createTargetProfile,
  findPaginatedTrainings,
  createBadge,
};

export { targetProfileController };
