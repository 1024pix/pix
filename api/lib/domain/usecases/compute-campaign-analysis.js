const _ = require('lodash');
const CampaignAnalysis = require('../models/CampaignAnalysis');
const CampaignTubeRecommendation = require('../models/CampaignTubeRecommendation');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function computeCampaignAnalysis(
  {
    userId,
    campaignId,
    campaignRepository,
    competenceRepository,
    targetProfileRepository,
    tubeRepository,
  } = {}) {

  const hasUserAccessToResult = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

  if (!hasUserAccessToResult) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
  }

  const [competences, tubes, targetProfile] = await Promise.all([
    competenceRepository.list(),
    tubeRepository.list(),
    targetProfileRepository.getByCampaignId(campaignId)
  ]);

  const targetedTubeIds = _.uniq(_.map(targetProfile.skills, (skill) => skill.tubeId));

  const campaignTubeRecommendations = _computeCampaignTubeRecommendations(campaignId, tubes, competences, targetedTubeIds);

  return new CampaignAnalysis({ id: campaignId, campaignTubeRecommendations });
};

function _computeCampaignTubeRecommendations(campaignId, tubes, competences, targetedTubeIds) {
  return _.map(targetedTubeIds, (tubeId) => {
    const tube = _.find(tubes, { id: tubeId });
    const competence = _.find(competences, { id: tube.competenceId });

    return new CampaignTubeRecommendation({
      campaignId,
      tubeId,
      competenceId: competence.id,
      competenceName: competence.name,
      tubePracticalTitle: tube.practicalTitle,
      areaColor: competence.area.color,
    });
  });
}
