export default function(schema, request) {
  const { id } = request.params;
  return schema.scorecards.find(id).tutorials;
}
