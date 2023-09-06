import { buildCampaigns } from './build-campaigns.js';
import { buildTargetProfiles } from './build-target-profiles.js';
import { buildTrainings } from './build-trainings.js';

async function teamDevcompDataBuilder({ databaseBuilder }) {
  await buildTargetProfiles(databaseBuilder);
  await buildTrainings(databaseBuilder);
  await buildCampaigns(databaseBuilder);
}

export { teamDevcompDataBuilder };
