export const startCampaignParticipation = async ({ campaignParticipationId, knowledgeElementSnapshotRepository }) => {
  // get ke snapshot for user participation
  const keSnapshot =
    knowledgeElementSnapshotRepository.findCampaignParticipationKnowledgeElementSnapshots(campaignParticipationId);

  // get tubes and skills for the campaign
  // sort user ke by tube
  // find the highest skill level for each tube
  // store each tube with the highest level in a row in the table
  return 42;
};
