import { extractTransformAndLoadData } from './extract-transform-and-load-data.js';
import { findCampaigns } from './find-campaigns.js';
import { findOrganizationIdsByClientApplication } from './find-organization-ids-by-client-application.js';
import { getCampaignOrganizationId } from './get-campaign-organization-id.js';
import { getCampaignParticipations } from './get-campaign-participations.js';

const usecases = {
  extractTransformAndLoadData,
  findCampaigns,
  findOrganizationIdsByClientApplication,
  getCampaignOrganizationId,
  getCampaignParticipations,
};

export { usecases };
