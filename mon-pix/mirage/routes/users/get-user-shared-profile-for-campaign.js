export default function(schema, request) {
  const { userId, campaignId } = request.params;
  const campaignParticipation = schema.campaignParticipations.findBy({ campaignId });
  const user = schema.users.findBy({ id: userId });

  if (!campaignParticipation || !campaignParticipation.isShared) return { data: null };

  return schema.sharedProfileForCampaigns.create({
    id: campaignParticipation.id,
    sharedAt: campaignParticipation.sharedAt,
    pixScore: user.pixScore,
    scorecards: user.scorecards.models,
  });
}
