export default function(schema, request) {
  const campaignParticipationId = request.params.id;
  const campaignParticipation = schema.campaignParticipations.find(campaignParticipationId);
  campaignParticipation.update({ isShared: true, sharedAt: new Date('2020-02-27') });
  return campaignParticipation;
}
