const CampaignReport = require('../models/CampaignReport');

module.exports = async function getCampaignReport({ campaignId, campaignParticipationRepository }) {
  const [participationsCount, sharedParticipationsCount] = await Promise.all([
    campaignParticipationRepository.count({ campaignId }),
    campaignParticipationRepository.count({ campaignId, isShared: true }),
  ]);

  return new CampaignReport({ id: campaignId, participationsCount, sharedParticipationsCount });
};
