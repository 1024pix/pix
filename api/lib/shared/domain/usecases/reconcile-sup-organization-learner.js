import { NotFoundError } from '../errors.js';

const reconcileSupOrganizationLearner = async function ({
  campaignCode,
  reconciliationInfo: { userId, studentNumber, firstName, lastName, birthdate },
  campaignRepository,
  supOrganizationLearnerRepository,
  organizationLearnerRepository,
  userReconciliationService,
}) {
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
