const CampaignReport = require('../models/CampaignReport');

module.exports = async function getCampaignReport({ campaignId, campaignParticipationRepository, stageRepository }) {
  const [participationsCount, sharedParticipationsCount, stages] = await Promise.all([
    campaignParticipationRepository.count({ campaignId }),
    campaignParticipationRepository.count({ campaignId, isShared: true }),
    stageRepository.getByCampaignId(campaignId),
  ]);

  return new CampaignReport({ id: campaignId, participationsCount, sharedParticipationsCount, stages });
};
