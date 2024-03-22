import { buildCampaigns } from './build-campaigns.js';
import { buildOrganizationLearners } from './build-learners.js';
import { buildOrganizationLearnerImportFormat } from './build-organization-learner-import-formats.js';
import { buildPlaceLots } from './build-place-lots.js';
import { buildTargetProfiles } from './build-target-profiles.js';

async function teamPrescriptionDataBuilder({ databaseBuilder }) {
  await buildTargetProfiles(databaseBuilder);
  await buildCampaigns(databaseBuilder);
  await buildOrganizationLearners(databaseBuilder);
  await buildOrganizationLearnerImportFormat(databaseBuilder);
  await buildPlaceLots(databaseBuilder);
}

export { teamPrescriptionDataBuilder };
