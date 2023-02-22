function findAssessmentParticipationResultList({
  campaignId,
  filters,
  page,
  campaignAssessmentParticipationResultListRepository,
}) {
  return campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({ campaignId, filters, page });
}

export default findAssessmentParticipationResultList;
