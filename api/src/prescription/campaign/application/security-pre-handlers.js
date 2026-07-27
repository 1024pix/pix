import * as checkCampaignBelongsToCombinedCourseUsecase from './usecases/checkCampaignBelongsToCombinedCourse.js';

async function checkCampaignBelongsToCombinedCourse(
  request,
  h,
  dependencies = { checkCampaignBelongsToCombinedCourseUsecase },
) {
  const campaignId = parseInt(request.params.campaignId);

  await dependencies.checkCampaignBelongsToCombinedCourseUsecase.execute({ campaignId });
  return h.response(true);
}

export const campaignSecurityPreHandlers = {
  checkCampaignBelongsToCombinedCourse,
};
