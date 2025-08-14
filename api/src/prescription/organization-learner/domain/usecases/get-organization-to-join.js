import * as injectedCombinedCourseRepository from '../../../../quest/infrastructure/repositories/combined-course-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
export const getOrganizationToJoin = async function ({
  code,
  organizationToJoinRepository,
  campaignRepository = injectedCampaignRepository,
  combinedCourseRepository = injectedCombinedCourseRepository,
} = {}) {
  const campaign = await campaignRepository.getByCode(code);

  if (campaign) {
    return organizationToJoinRepository.get({ id: campaign.organizationId });
  }

  const combinedCourse = await combinedCourseRepository.getByCode({ code });

  return organizationToJoinRepository.get({
    id: combinedCourse.organizationId,
  });
};
