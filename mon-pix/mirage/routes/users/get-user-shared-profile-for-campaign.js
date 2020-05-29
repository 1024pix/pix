export default function(schema, request) {
  const campaignId = request.params.campaignId;
  const campaignParticipation = schema.campaignParticipations.findBy({ campaignId });
  return campaignParticipation ? campaignParticipation : { data: null };
}
