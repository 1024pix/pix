import * as injectedCampaignAssessmentParticipationResultListRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-list-repository.js';
const findAssessmentParticipationResultList = async ({
  campaignId,
  filters,
  page,
  campaignAssessmentParticipationResultListRepository = injectedCampaignAssessmentParticipationResultListRepository,
} = {}) => campaignAssessmentParticipationResultListRepository.findPaginatedByCampaignId({ campaignId, filters, page });

export { findAssessmentParticipationResultList };
