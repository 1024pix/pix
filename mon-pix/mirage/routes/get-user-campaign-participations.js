export default function(schema, request) {
  const userId = request.params.id;
  const user = schema.users.find(userId);

  user.update('campaignParticipations', schema.campaignParticipations.where({ userId }));

  return user.campaignParticipations;
}
