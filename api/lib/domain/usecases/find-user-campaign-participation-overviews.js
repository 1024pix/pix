const bluebird = require('bluebird');

const CampaignParticipationOverview = require('../read-models/CampaignParticipationOverview');

module.exports = async function findUserCampaignParticipationOverviews({
  userId,
  states,
  page,
  campaignParticipationOverviewRepository,
  targetProfileWithLearningContentRepository,
}) {
  const concatenatedStates = states ? [].concat(states) : undefined;

  const result = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
    userId,
    states: concatenatedStates,
    page,
  });

  const campaignParticipationOverviews = await _buildCampaignParticipationOverviews(
    result.campaignParticipationOverviews,
    targetProfileWithLearningContentRepository,
  );

  return {
    campaignParticipationOverviews,
    pagination: result.pagination,
  };
};

async function _buildCampaignParticipationOverviews(overviews, targetProfileWithLearningContentRepository) {
  return bluebird.mapSeries(
    overviews,
    async (overview) => {
      if (!overview.isShared) return overview;

      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: overview.targetProfileId });

      return new CampaignParticipationOverview({
        ...overview,
        totalSkillsCount: targetProfile.skills.length,
      });
    });
}
