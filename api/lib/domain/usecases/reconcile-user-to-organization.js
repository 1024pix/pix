const { CampaignCodeError, UserCouldNotBeReconciledError } = require('../../domain/errors');
const _ = require('lodash');

module.exports = async function reconcileUserToOrganization({
  campaignCode,
  userId,
  campaignRepository,
  schoolingRegistrationRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const studentSchoolingRegistrations = await schoolingRegistrationRepository.findByUserId({ userId });

  if (_.isEmpty(studentSchoolingRegistrations)) {
    throw new UserCouldNotBeReconciledError();
  }

  const nationalStudentIdForReconcile = _.orderBy(studentSchoolingRegistrations, 'updatedAt', 'desc')[0]
    .nationalStudentId;

  return schoolingRegistrationRepository.reconcileUserByNationalStudentIdAndOrganizationId({
    userId,
    nationalStudentId: nationalStudentIdForReconcile,
    organizationId: campaign.organizationId,
  });
};
