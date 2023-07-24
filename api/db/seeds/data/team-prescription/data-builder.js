import { buildCampaigns } from './build-campaigns.js';
import { buildOrganizations } from './build-organization.js';
import { buildTargetProfiles } from './build-target-profiles.js';

async function teamPrescriptionDataBuilder({ databaseBuilder }) {
  await buildOrganizations(databaseBuilder);
  await buildTargetProfiles(databaseBuilder);
  await buildCampaigns(databaseBuilder);
}

export { teamPrescriptionDataBuilder };
