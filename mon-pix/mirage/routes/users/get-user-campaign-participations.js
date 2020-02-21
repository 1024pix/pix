export default function(schema, request) {
  const userId = request.params.id;
  return schema.users.find(userId).campaignParticipations;
}
