import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSummarySerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-summary-serializer.js';
import { evaluationUsecases } from '../../../src/evaluation/domain/usecases/index.js';
import { deserializer as badgeCreationDeserializer } from '../../../src/evaluation/infrastructure/serializers/jsonapi/badge-creation-serializer.js';
import * as badgeSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/badge-serializer.js';
import * as queryParamsUtils from '../../../src/shared/infrastructure/utils/query-params-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as organizationSerializer from '../../infrastructure/serializers/jsonapi/organization-serializer.js';
import * as targetProfileAttachOrganizationSerializer from '../../infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer.js';
import * as targetProfileForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js';
import * as targetProfileSerializer from '../../infrastructure/serializers/jsonapi/target-profile-serializer.js';
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

const findPaginatedFilteredTargetProfileOrganizations = async function (request) {
  const targetProfileId = request.params.id;
  const options = queryParamsUtils.extractParameters(request.query);

  const { models: organizations, pagination } = await usecases.findPaginatedFilteredTargetProfileOrganizations({
    targetProfileId,
    filter: options.filter,
    page: options.page,
  });
  return organizationSerializer.serialize(organizations, pagination);
};

const attachOrganizations = async function (request, h, dependencies = { targetProfileAttachOrganizationSerializer }) {
  const organizationIds = request.payload['organization-ids'];
  const targetProfileId = request.params.id;
  const results = await usecases.attachOrganizationsToTargetProfile({ targetProfileId, organizationIds });

  return h
    .response(dependencies.targetProfileAttachOrganizationSerializer.serialize({ ...results, targetProfileId }))
    .code(200);
};

const updateTargetProfile = async function (request, h) {
  const id = request.params.id;
  const {
    name,
    'image-url': imageUrl,
    description,
    comment,
    category,
    'are-knowledge-elements-resettable': areKnowledgeElementsResettable,
  } = request.payload.data.attributes;
  await usecases.updateTargetProfile({
    id,
    name,
    imageUrl,
    description,
    comment,
    category,
    areKnowledgeElementsResettable,
  });
  return h.response({}).code(204);
};

const outdateTargetProfile = async function (request, h) {
  const id = request.params.id;

  await usecases.outdateTargetProfile({ id });
  return h.response({}).code(204);
};

const createTargetProfile = async function (request) {
  const targetProfileCreationCommand = targetProfileSerializer.deserializeCreationCommand(request.payload);

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

const markTargetProfileAsSimplifiedAccess = async function (request, h) {
  const id = request.params.id;

  const targetProfile = await usecases.markTargetProfileAsSimplifiedAccess({ id });
  return h.response(targetProfileSerializer.serialize(targetProfile));
};

const targetProfileController = {
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  getTargetProfileForAdmin,
  findPaginatedFilteredTargetProfileOrganizations,
  attachOrganizations,
  updateTargetProfile,
  outdateTargetProfile,
  createTargetProfile,
  findPaginatedTrainings,
  createBadge,
  markTargetProfileAsSimplifiedAccess,
};

export { targetProfileController };
