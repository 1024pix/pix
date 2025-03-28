export const startCampaignParticipation = async ({
  campaignId,
  campaignParticipationId,
  locale,
  knowledgeElementSnapshotRepository,
  learningContentRepository,
}) => {
  // get ke snapshot for user participation
  const knowledgeElementsByParticipation = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
    campaignParticipationId,
  ]);

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);

  // sort user ke by tube
  // find the highest skill level for each tube
  // store each tube with the highest level in a row in the table
};
