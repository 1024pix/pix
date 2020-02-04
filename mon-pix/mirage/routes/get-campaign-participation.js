import Response from 'ember-cli-mirage/response';

export default function(schema, request) {
  const assessmentId = request.queryParams['filter[assessmentId]'];

  if (assessmentId) {
    const campaignParticipations = schema.campaignParticipations.where({ assessmentId });
    if (campaignParticipations.length === 0) {
      return new Response(404);
    }
    return campaignParticipations;
  }
  return schema.campaignParticipations.all();
}
