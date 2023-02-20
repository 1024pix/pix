import { CampaignCodeError, UserCouldNotBeReconciledError } from '../../domain/errors';
import _ from 'lodash';

export default async function reconcileScoOrganizationLearnerAutomatically({
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
}
