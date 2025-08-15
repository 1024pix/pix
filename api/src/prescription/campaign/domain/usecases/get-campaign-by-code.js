import * as injectedOrganizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
const getCampaignByCode = async function ({
  code,
  campaignToJoinRepository = injectedRepositories.campaignToJoinRepository,
  organizationLearnerImportFormatRepository = injectedOrganizationLearnerImportFormatRepository,
} = {}) {
  const campaignToJoin = await campaignToJoinRepository.getByCode({ code });

  if (campaignToJoin.isRestricted) {
    const config = await organizationLearnerImportFormatRepository.get(campaignToJoin.organizationId);

    if (config) campaignToJoin.setReconciliationFields(config.reconciliationFields);
  }

  return campaignToJoin;
};

export { getCampaignByCode };
