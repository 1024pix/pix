import _ from 'lodash';
import { usecases } from '../../../../src/prescription/campaign/domain/usecases/index.js';
import * as campaignReportSerializer from '../infrastructure/serializers/jsonapi/campaign-report-serializer.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import * as csvSerializer from '../../../../lib/infrastructure/serializers/csv/csv-serializer.js';

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

const campaignAdministrationController = {
  save,
  createCampaigns,
};

export { campaignAdministrationController };

function _getOwnerId(ownerId, defaultOwnerId) {
  return ownerId ? ownerId : defaultOwnerId;
}
