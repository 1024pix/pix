import { buildCampaigns } from './build-campaigns.js';
import { buildOrganizations } from './build-organization.js';
import { buildTargetProfiles } from './build-target-profiles.js';
import { buildTrainings } from './build-trainings.js';

async function teamDevcompDataBuilder({ databaseBuilder }) {
  await buildOrganizations(databaseBuilder);
  await buildTargetProfiles(databaseBuilder);
  await buildTrainings(databaseBuilder);
  await databaseBuilder.commit();
  await buildCampaigns(databaseBuilder);
}

export { teamDevcompDataBuilder };
