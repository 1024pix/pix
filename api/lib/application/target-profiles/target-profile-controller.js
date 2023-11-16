import { usecases } from '../../domain/usecases/index.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import * as targetProfileSerializer from '../../infrastructure/serializers/jsonapi/target-profile-serializer.js';
import * as targetProfileSummaryForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';
import * as targetProfileForAdminSerializer from '../../infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js';
import * as queryParamsUtils from '../../infrastructure/utils/query-params-utils.js';
import { escapeFileName } from '../../infrastructure/utils/request-response-utils.js';
import * as organizationSerializer from '../../infrastructure/serializers/jsonapi/organization-serializer.js';
import * as badgeSerializer from '../../infrastructure/serializers/jsonapi/badge-serializer.js';
import { deserializer as badgeCreationDeserializer } from '../../infrastructure/serializers/jsonapi/badge-creation-serializer.js';
import * as targetProfileAttachOrganizationSerializer from '../../infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer.js';
import * as learningContentPDFPresenter from './presenter/pdf/learning-content-pdf-presenter.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as trainingSummarySerializer from '../../infrastructure/serializers/jsonapi/training-summary-serializer.js';

const findPaginatedFilteredTargetProfileSummariesForAdmin = async function (request) {
  const options = queryParamsUtils.extractParameters(request.query);

  const { models: targetProfileSummaries, meta } = await usecases.findPaginatedFilteredTargetProfileSummariesForAdmin({
    filter: options.filter,
    page: options.page,
  });
  return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries, meta);
};

const getTargetProfileForAdmin = async function (request, h, dependencies = { targetProfileForAdminSerializer }) {
  const targetProfileId = request.params.id;
  const targetProfileForAdmin = await usecases.getTargetProfileForAdmin({ targetProfileId });
  return dependencies.targetProfileForAdminSerializer.serialize(targetProfileForAdmin);
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

const getContentAsJsonFile = async function (request, h, dependencies = { tokenService }) {
  const targetProfileId = request.params.id;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);

  const { jsonContent, fileName } = await usecases.getTargetProfileContentAsJson({ userId, targetProfileId });
  const escapedFilename = escapeFileName(fileName);

  return h
    .response(jsonContent)
    .header('Content-Type', 'text/json;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${escapedFilename}`);
};

const attachOrganizations = async function (request, h, dependencies = { targetProfileAttachOrganizationSerializer }) {
  const organizationIds = request.payload['organization-ids'];
  const targetProfileId = request.params.id;
  const results = await usecases.attachOrganizationsToTargetProfile({ targetProfileId, organizationIds });

  return h
    .response(dependencies.targetProfileAttachOrganizationSerializer.serialize({ ...results, targetProfileId }))
    .code(200);
};

const attachOrganizationsFromExistingTargetProfile = async function (request, h) {
  const existingTargetProfileId = request.payload['target-profile-id'];
  const targetProfileId = request.params.id;
  await usecases.attachOrganizationsFromExistingTargetProfile({ targetProfileId, existingTargetProfileId });
  return h.response({}).code(204);
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

  const { trainings, meta } = await usecases.findPaginatedTargetProfileTrainingSummaries({
    targetProfileId,
    page,
  });
  return dependencies.trainingSummarySerializer.serialize(trainings, meta);
};

const createBadge = async function (request, h) {
  const targetProfileId = request.params.id;
  const badgeCreation = await badgeCreationDeserializer.deserialize(request.payload);

  const createdBadge = await usecases.createBadge({ targetProfileId, badgeCreation });

  return h.response(badgeSerializer.serialize(createdBadge)).created();
};

const markTargetProfileAsSimplifiedAccess = async function (request, h) {
  const id = request.params.id;

  const targetProfile = await usecases.markTargetProfileAsSimplifiedAccess({ id });
  return h.response(targetProfileSerializer.serialize(targetProfile));
};

const getLearningContentAsPdf = async function (request, h, dependencies = { learningContentPDFPresenter }) {
  const targetProfileId = request.params.id;
  const { title, language } = request.query;

  const learningContent = await usecases.getLearningContentByTargetProfile({ targetProfileId, language });
  const pdfBuffer = await dependencies.learningContentPDFPresenter.present(learningContent, title, language);

  const date = new Date();
  const dateString = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
  const timeString = date.getHours() + '-' + date.getMinutes();
  const fileName = `${title}_${dateString}_${timeString}.pdf`;

  return h
    .response(pdfBuffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const targetProfileController = {
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  getTargetProfileForAdmin,
  findPaginatedFilteredTargetProfileOrganizations,
  getContentAsJsonFile,
  attachOrganizations,
  attachOrganizationsFromExistingTargetProfile,
  updateTargetProfile,
  outdateTargetProfile,
  createTargetProfile,
  findPaginatedTrainings,
  createBadge,
  markTargetProfileAsSimplifiedAccess,
  getLearningContentAsPdf,
};

export { targetProfileController };
