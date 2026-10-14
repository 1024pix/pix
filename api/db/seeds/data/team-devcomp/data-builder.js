import { buildCampaigns } from './build-campaigns.js';
import { buildModules } from './build-modules.js';
import { createDevcompOrganization } from './build-organization.js';
import { createDevcompOrganizationLearners } from './build-organization-learners.js';
import { buildTargetProfiles } from './build-target-profiles.js';
import { buildTrainings } from './build-trainings.js';
import { createDevcompUser } from './build-user.js';

async function teamDevcompDataBuilder({ databaseBuilder }) {
  const adminId = await createDevcompUser(databaseBuilder);
  const organizationIds = await createDevcompOrganization({ databaseBuilder, adminId });
  const learnersCount = await createDevcompOrganizationLearners(databaseBuilder);
  await databaseBuilder.commit();

  await buildTargetProfiles({ databaseBuilder, organizationIds });
  const trainingsIds = await buildTrainings(databaseBuilder);
  await buildCampaigns(databaseBuilder, trainingsIds, learnersCount);
  await buildModules(databaseBuilder);
}

export { teamDevcompDataBuilder };
