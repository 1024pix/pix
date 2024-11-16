import { buildCampaigns } from './build-campaigns.js';
import { createDevcompOrganization } from './build-organization.js';
import { buildTargetProfiles } from './build-target-profiles.js';
import { buildTrainings } from './build-trainings.js';

async function teamDevcompDataBuilder({ databaseBuilder }) {
  await buildTargetProfiles(databaseBuilder);
  await createDevcompOrganization(databaseBuilder);
  const trainingsIds = await buildTrainings(databaseBuilder);
  await buildCampaigns(databaseBuilder, trainingsIds);
}

export { teamDevcompDataBuilder };
