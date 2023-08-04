import { buildCampaigns } from './build-campaigns.js';
import { buildOrganizations } from './build-organization.js';

async function teamDevcompDataBuilder({ databaseBuilder }) {
  await buildOrganizations(databaseBuilder);
  await databaseBuilder.commit();
  await buildCampaigns(databaseBuilder);
}

export { teamDevcompDataBuilder };
