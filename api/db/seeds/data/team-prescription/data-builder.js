import { buildCampaigns } from './build-campaigns.js';
import { buildTargetProfiles } from './build-target-profiles.js';
import { buildOrganizationLearners } from './build-learners.js';
import { buildPlaceLots } from './build-place-lots.js';

async function teamPrescriptionDataBuilder({ databaseBuilder }) {
  await buildTargetProfiles(databaseBuilder);
  await buildCampaigns(databaseBuilder);
  await buildOrganizationLearners(databaseBuilder);
  await buildPlaceLots(databaseBuilder);
}

export { teamPrescriptionDataBuilder };
