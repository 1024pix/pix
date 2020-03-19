export default function(schema, request) {
  const campaignParticipationId = request.params.id;
  const campaignParticipation = schema.campaignParticipations.find(campaignParticipationId);
  campaignParticipation.update({ isShared: true });
  return campaignParticipation;
}
