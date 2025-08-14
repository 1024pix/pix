import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as injectedUserReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as injectedSupOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';

const reconcileSupOrganizationLearner = async function ({
  campaignCode,
  reconciliationInfo: { userId, studentNumber, firstName, lastName, birthdate },
  campaignRepository = injectedCampaignRepository,
  supOrganizationLearnerRepository = injectedSupOrganizationLearnerRepository,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  userReconciliationService = injectedUserReconciliationService,
} = {}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new NotFoundError();
  }

  const matchedOrganizationLearner =
    await userReconciliationService.findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser({
      organizationId: campaign.organizationId,
      reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
      supOrganizationLearnerRepository,
    });

  return organizationLearnerRepository.reconcileUserToOrganizationLearner({
    userId,
    organizationLearnerId: matchedOrganizationLearner.id,
  });
};

export { reconcileSupOrganizationLearner };
