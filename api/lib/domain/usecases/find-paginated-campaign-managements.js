export default function findPaginatedCampaignManagements({ organizationId, page, campaignManagementRepository }) {
  return campaignManagementRepository.findPaginatedCampaignManagements({ organizationId, page });
}
