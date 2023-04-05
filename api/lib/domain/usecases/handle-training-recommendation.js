const config = require('../../config');

module.exports = async function handleTrainingRecommendation({
  locale,
  assessment,
  campaignRepository,
  knowledgeElementRepository,
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

  if (trainings.length === 0) {
    return;
  }

  if (config.featureToggles.isTrainingRecommendationEnabled) {
    const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
      campaignParticipationId,
      domainTransaction,
    });
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: assessment.userId,
      domainTransaction,
    });

    for (const training of trainings) {
      if (training.shouldBeObtained(knowledgeElements, campaignSkills)) {
        await userRecommendedTrainingRepository.save({
          userId: assessment.userId,
          trainingId: training.id,
          campaignParticipationId,
          domainTransaction,
        });
      }
    }
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
