export default function(schema, request) {
  const challengeId = request.params.id;
  return schema.challenges.find(challengeId);
}
