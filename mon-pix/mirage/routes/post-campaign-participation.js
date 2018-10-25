export default function(schema, request) {
  const params = JSON.parse(request.requestBody);

  const participantExternalId = params.data.attributes['participant-external-id'];
  const newAssessment = {
    'user-id': 'user_id',
    'user-name': 'Jane Doe',
    'user-email': 'jane@acme.com',
  };
  newAssessment.type = 'SMART_PLACEMENT';

  const assessment = schema.assessments.create(newAssessment);
  return schema.campaignParticipations.create({ assessment, participantExternalId });
}
