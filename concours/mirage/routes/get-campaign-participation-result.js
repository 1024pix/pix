export default function(schema, request) {
  const campaignParticipationId = request.params.id;
  return schema.campaignParticipations.find(campaignParticipationId).campaignParticipationResult;
}
