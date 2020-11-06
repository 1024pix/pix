const CampaignAssessmentInfo = require('../../../../lib/domain/read-models/CampaignAssessmentInfo');

module.exports = function buildCampaignAssessmentInfo(
  {
    campaignParticipationId = 123,
    userId = 456,
    campaignId = 789,
    assessmentId = 159,
    status = CampaignAssessmentInfo.statuses.ONGOING,
    isImproving = false,
  } = {}) {
  const campaignAssessmentInfo = new CampaignAssessmentInfo({
    campaignParticipationId,
    userId,
    campaignId,
    assessmentId,
    isImproving,
  });
  campaignAssessmentInfo.status = status;
  return campaignAssessmentInfo;
};
