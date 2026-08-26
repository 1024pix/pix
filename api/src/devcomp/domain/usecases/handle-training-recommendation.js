const handleTrainingRecommendation = async function ({
  locale,
  assessment,
  campaignRepository,
  knowledgeStateRepository,
  trainingRepository,
  userRecommendedTrainingRepository,
}) {
  if (!assessment.isCampaignParticipationAvailable()) {
    return;
  }
  const { campaignParticipationId } = assessment;
  const trainings = await trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale({
    campaignParticipationId,
    locale,
  });

  if (trainings.length === 0) {
    return;
  }

  const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
    campaignParticipationId,
  });
  const knowledgeState = await knowledgeStateRepository.findByUserId({
    userId: assessment.userId,
  });

  for (const training of trainings) {
    if (training.shouldBeObtained(knowledgeState, campaignSkills)) {
      await userRecommendedTrainingRepository.save({
        userId: assessment.userId,
        trainingId: training.id,
        campaignParticipationId,
      });
    }
  }
  return;
};

export { handleTrainingRecommendation };
