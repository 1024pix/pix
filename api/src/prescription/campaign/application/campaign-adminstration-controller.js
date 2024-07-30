import _ from 'lodash';

import { usecases } from '../../../../src/prescription/campaign/domain/usecases/index.js';
import * as checkAdminMemberHasRoleSuperAdminUseCase from '../../../shared/application/usecases/checkAdminMemberHasRoleSuperAdmin.js';
import * as csvSerializer from '../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as csvCampaignsIdsParser from '../infrastructure/serializers/csv/csv-campaigns-ids-parser.js';
import * as campaignManagementSerializer from '../infrastructure/serializers/jsonapi/campaign-management-serializer.js';
import * as campaignReportSerializer from '../infrastructure/serializers/jsonapi/campaign-report-serializer.js';

const createCampaigns = async function (request, h, dependencies = { csvSerializer }) {
  const campaignsToCreate = await dependencies.csvSerializer.deserializeForCampaignsImport(request.payload.path);
  await usecases.createCampaigns({ campaignsToCreate });
  return h.response(null).code(204);
};

const save = async function (request, h, dependencies = { requestResponseUtils, campaignReportSerializer }) {
  const creatorId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const {
    name,
    type,
    title,
    'multiple-sendings': multipleSendings,
    'id-pix-label': idPixLabel,
    'custom-landing-page-text': customLandingPageText,
    'owner-id': ownerId,
  } = request.payload.data.attributes;

  const targetProfileId = parseInt(_.get(request, 'payload.data.relationships.target-profile.data.id')) || null;

  const organizationId = parseInt(_.get(request, 'payload.data.relationships.organization.data.id')) || null;

  const campaign = {
    name,
    type,
    title,
    idPixLabel,
    customLandingPageText,
    creatorId,
    ownerId: _getOwnerId(ownerId, creatorId),
    organizationId,
    targetProfileId,
    multipleSendings,
  };

  const createdCampaign = await usecases.createCampaign({ campaign });
  return h.response(dependencies.campaignReportSerializer.serialize(createdCampaign)).created();
};

const update = async function (request, _, dependencies = { campaignReportSerializer }) {
  const campaignId = request.params.id;

  const result = await usecases.updateCampaign({ campaignId, ...request.deserializedPayload });

  return dependencies.campaignReportSerializer.serialize(result);
};

const swapCampaignCodes = async function (request, h) {
  const { firstCampaignId, secondCampaignId } = request.payload;

  await usecases.swapCampaignCodes({ firstCampaignId, secondCampaignId });

  return h.response(null).code(204);
};

const updateCampaignDetails = async function (request, h) {
  const campaignId = request.params.id;
  const authenticatedUserId = request.auth.credentials.userId;

  const campaignDetails = request.deserializedPayload;
  const isSuperAdmin = await checkAdminMemberHasRoleSuperAdminUseCase.execute(authenticatedUserId);

  await usecases.updateCampaignDetails({
    isAuthorizedToUpdateIsForAbsoluteNovice: isSuperAdmin,
    campaignId,
    ...campaignDetails,
  });
  return h.response({}).code(204);
};

const updateCampaignCode = async function (request, h) {
  const { campaignId } = request.params;
  const { campaignCode } = request.payload;

  await usecases.updateCampaignCode({ campaignId, campaignCode });

  return h.response(null).code(204);
};

const archiveCampaign = function (request, h, dependencies = { campaignReportSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  return usecases.archiveCampaign({ userId, campaignId }).then(dependencies.campaignReportSerializer.serialize);
};

const unarchiveCampaign = function (request, h, dependencies = { campaignReportSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.id;

  return usecases.unarchiveCampaign({ userId, campaignId }).then(dependencies.campaignReportSerializer.serialize);
};

const archiveCampaigns = async function (request, h, dependencies = { csvCampaignsIdsParser }) {
  const { userId } = request.auth.credentials;
  const campaignIds = await dependencies.csvCampaignsIdsParser.extractCampaignsIds(request.payload.path);

  await usecases.archiveCampaigns({
    userId,
    campaignIds,
  });

  return h.response(null).code(204);
};

const findPaginatedCampaignManagements = async function (
  request,
  h,
  dependencies = {
    campaignManagementSerializer,
  },
) {
  const organizationId = request.params.organizationId;
  const { filter, page } = request.query;

  const { models: campaigns, meta } = await usecases.findPaginatedCampaignManagements({
    organizationId,
    filter,
    page,
  });
  return dependencies.campaignManagementSerializer.serialize(campaigns, meta);
};

const deleteCampaigns = async function (request, h) {
  const userId = extractUserIdFromRequest(request);
  const { organizationId } = request.params;
  const campaignIds = request.deserializedPayload.map(({ id }) => id);

  await usecases.deleteCampaigns({ userId, organizationId, campaignIds });

  return h.response(null).code(204);
};

const campaignAdministrationController = {
  save,
  update,
  createCampaigns,
  swapCampaignCodes,
  findPaginatedCampaignManagements,
  updateCampaignDetails,
  updateCampaignCode,
  archiveCampaign,
  archiveCampaigns,
  unarchiveCampaign,
  deleteCampaigns,
};

export { campaignAdministrationController };

function _getOwnerId(ownerId, defaultOwnerId) {
  return ownerId ? ownerId : defaultOwnerId;
}
