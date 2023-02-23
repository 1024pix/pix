const usecases = require('../../domain/usecases/index.js');
const tokenService = require('../../domain/services/token-service');
const targetProfileSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-serializer');
const targetProfileSummaryForAdminSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer');
const targetProfileForAdminOldSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-for-admin-old-format-serializer');
const targetProfileForAdminNewSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-for-admin-new-format-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');
const organizationSerializer = require('../../infrastructure/serializers/jsonapi/organization-serializer');
const badgeSerializer = require('../../infrastructure/serializers/jsonapi/badge-serializer');
const badgeCreationSerializer = require('../../infrastructure/serializers/jsonapi/badge-creation-serializer');
const stageSerializer = require('../../infrastructure/serializers/jsonapi/stage-serializer');
const targetProfileAttachOrganizationSerializer = require('../../infrastructure/serializers/jsonapi/target-profile-attach-organization-serializer');
const learningContentPDFPresenter = require('./presenter/pdf/learning-content-pdf-presenter');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = {
  async findPaginatedFilteredTargetProfileSummariesForAdmin(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: targetProfileSummaries, meta } = await usecases.findPaginatedFilteredTargetProfileSummariesForAdmin(
      {
        filter: options.filter,
        page: options.page,
      }
    );
    return targetProfileSummaryForAdminSerializer.serialize(targetProfileSummaries, meta);
  },

  async getTargetProfileForAdmin(request) {
    const targetProfileId = request.params.id;
    const targetProfileForAdmin = await usecases.getTargetProfileForAdmin({ targetProfileId });
    if (targetProfileForAdmin.isNewFormat) return targetProfileForAdminNewSerializer.serialize(targetProfileForAdmin);
    return targetProfileForAdminOldSerializer.serialize(targetProfileForAdmin);
  },

  async findPaginatedFilteredTargetProfileOrganizations(request) {
    const targetProfileId = request.params.id;
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: organizations, pagination } = await usecases.findPaginatedFilteredTargetProfileOrganizations({
      targetProfileId,
      filter: options.filter,
      page: options.page,
    });
    return organizationSerializer.serialize(organizations, pagination);
  },

  async getContentAsJsonFile(request, h) {
    const targetProfileId = request.params.id;
    const token = request.query.accessToken;
    const userId = tokenService.extractUserId(token);

    const { jsonContent, fileName } = await usecases.getTargetProfileContentAsJson({ userId, targetProfileId });

    const escapedFilename = requestResponseUtils.escapeFileName(fileName);

    return h
      .response(jsonContent)
      .header('Content-Type', 'text/json;charset=utf-8')
      .header('Content-Disposition', `attachment; filename=${escapedFilename}`);
  },

  async attachOrganizations(request, h) {
    const organizationIds = request.payload['organization-ids'];
    const targetProfileId = request.params.id;
    const results = await usecases.attachOrganizationsToTargetProfile({ targetProfileId, organizationIds });

    return h.response(targetProfileAttachOrganizationSerializer.serialize({ ...results, targetProfileId })).code(200);
  },

  async attachOrganizationsFromExistingTargetProfile(request, h) {
    const existingTargetProfileId = request.payload['target-profile-id'];
    const targetProfileId = request.params.id;
    await usecases.attachOrganizationsFromExistingTargetProfile({ targetProfileId, existingTargetProfileId });
    return h.response({}).code(204);
  },

  async updateTargetProfile(request, h) {
    const id = request.params.id;
    const { name, description, comment, category } = request.payload.data.attributes;
    await usecases.updateTargetProfile({ id, name, description, comment, category });
    return h.response({}).code(204);
  },

  async outdateTargetProfile(request, h) {
    const id = request.params.id;

    await usecases.outdateTargetProfile({ id });
    return h.response({}).code(204);
  },

  async createTargetProfile(request) {
    const targetProfileCreationCommand = targetProfileSerializer.deserializeCreationCommand(request.payload);

    const targetProfileId = await DomainTransaction.execute(async (domainTransaction) => {
      return usecases.createTargetProfile({
        targetProfileCreationCommand,
        domainTransaction,
      });
    });
    return targetProfileSerializer.serializeId(targetProfileId);
  },

  async findStages(request) {
    const targetProfileId = request.params.id;

    const stages = await usecases.findTargetProfileStages({ targetProfileId });
    return stageSerializer.serialize(stages);
  },

  async createBadge(request, h) {
    const targetProfileId = request.params.id;
    const badgeCreation = await badgeCreationSerializer.deserialize(request.payload);

    const createdBadge = await usecases.createBadge({ targetProfileId, badgeCreation });

    return h.response(badgeSerializer.serialize(createdBadge)).created();
  },

  async markTargetProfileAsSimplifiedAccess(request, h) {
    const id = request.params.id;

    const targetProfile = await usecases.markTargetProfileAsSimplifiedAccess({ id });
    return h.response(targetProfileSerializer.serialize(targetProfile));
  },

  async getLearningContentAsPdf(request, h) {
    const targetProfileId = request.params.id;
    const { title, language } = request.query;

    const learningContent = await usecases.getLearningContentByTargetProfile({ targetProfileId, language });
    const pdfBuffer = await learningContentPDFPresenter.present(learningContent, title, language);

    const date = new Date();
    const dateString = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    const timeString = date.getHours() + '-' + date.getMinutes();
    const fileName = `${title}_${dateString}_${timeString}.pdf`;

    return h
      .response(pdfBuffer)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  },
};
