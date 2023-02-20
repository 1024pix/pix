export default async function handleTrainingRecommendation({
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
  const trainings = await trainingRepository.findByCampaignParticipationIdAndLocale({
    campaignParticipationId,
    locale,
    domainTransaction,
  });
  for (const training of trainings) {
    await userRecommendedTrainingRepository.save({
      userId: assessment.userId,
      trainingId: training.id,
      campaignParticipationId,
      domainTransaction,
    });
  }
}
