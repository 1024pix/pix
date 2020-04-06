export default function(schema, request) {
  const campaignId = request.params.campaignId;
  return schema.campaignParticipations.findBy({ campaignId });
}
