export default async function archiveCampaigns({ userId, campaignIds, campaignAdministrationRepository }) {
  await campaignAdministrationRepository.archiveCampaigns(campaignIds, userId);
}
