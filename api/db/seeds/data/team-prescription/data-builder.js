import { buildCampaigns } from './build-campaigns.js';
import { buildOrganizations } from './build-organization.js';

async function teamPrescriptionDataBuilder({ databaseBuilder }) {
  buildOrganizations(databaseBuilder);
  buildCampaigns(databaseBuilder);
}

export { teamPrescriptionDataBuilder };
