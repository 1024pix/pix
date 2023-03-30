const config = require('../../config');

module.exports = async function handleTrainingRecommendation({
  locale,
  assessment,
  trainingRepository,
  userRecommendedTrainingRepository,
  domainTransaction,
}) {
  if (!assessment.isForCampaign()) {
    return;
  }
  const { campaignParticipationId } = assessment;
  const trainings = await trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale({
    campaignParticipationId,
    locale,
    domainTransaction,
  });

  if (config.featureToggles.isTrainingRecommendationEnabled) {
    return;
  } else {
    for (const training of trainings) {
      await userRecommendedTrainingRepository.save({
        userId: assessment.userId,
        trainingId: training.id,
        campaignParticipationId,
        domainTransaction,
      });
    }
  }
};
