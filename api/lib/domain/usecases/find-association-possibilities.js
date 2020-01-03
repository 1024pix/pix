const { CampaignCodeError } = require('../errors');

module.exports = async function findAssociationPossibilities({
  user,
  campaignCode,
  campaignRepository,
  studentRepository,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  return userReconciliationService.findMatchingOrganizationStudentIdForGivenUser({ organizationId: campaign.organizationId, user, studentRepository });
};
