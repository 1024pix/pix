import { buildCampaigns } from './build-campaigns.js';
import { buildTargetProfiles } from './build-target-profiles.js';
import { buildOrganizationLearners } from './build-learners.js';

async function teamPrescriptionDataBuilder({ databaseBuilder }) {
  await buildTargetProfiles(databaseBuilder);
  await buildCampaigns(databaseBuilder);
  await buildOrganizationLearners(databaseBuilder);
}

export { teamPrescriptionDataBuilder };
