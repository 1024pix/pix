export async function getCombinedCourseExistsForCampaignId({ campaignId, combinedCourseRepository }) {
  return combinedCourseRepository.existsForCampaignId({ campaignId });
}
