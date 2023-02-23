const { CampaignCodeError, UserCouldNotBeReconciledError } = require('../../domain/errors.js');
const _ = require('lodash');

module.exports = async function reconcileScoOrganizationLearnerAutomatically({
  campaignCode,
  userId,
  campaignRepository,
  organizationLearnerRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const studentOrganizationLearners = await organizationLearnerRepository.findByUserId({ userId });

  if (_.isEmpty(studentOrganizationLearners)) {
    throw new UserCouldNotBeReconciledError();
  }

  const nationalStudentIdForReconcile = _.orderBy(studentOrganizationLearners, 'updatedAt', 'desc')[0]
    .nationalStudentId;

  return organizationLearnerRepository.reconcileUserByNationalStudentIdAndOrganizationId({
    userId,
    nationalStudentId: nationalStudentIdForReconcile,
    organizationId: campaign.organizationId,
  });
};
