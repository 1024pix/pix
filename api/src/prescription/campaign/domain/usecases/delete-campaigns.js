import { CampaignsDestructor } from '../models/CampaignsDestructor.js';

const deleteCampaigns = async ({
  userId,
  organizationId,
  campaignIds,
  organizationMembershipRepository,
  campaignAdministrationRepository,
  campaignParticipationRepository,
}) => {
  const membership = await organizationMembershipRepository.getByUserIdAndOrganizationId({ userId, organizationId });
  const campaignsToDelete = await campaignAdministrationRepository.getByIds(campaignIds);
  const campaignParticipationsToDelete = await campaignParticipationRepository.getByCampaignIds(campaignIds);

  const campaignDestructor = new CampaignsDestructor({
    campaignsToDelete,
    campaignParticipationsToDelete,
    userId,
    organizationId,
    membership,
  });
  campaignDestructor.delete();

  await campaignParticipationRepository.batchUpdate(campaignParticipationsToDelete);
  await campaignAdministrationRepository.batchUpdate(campaignsToDelete);
};

export { deleteCampaigns };
