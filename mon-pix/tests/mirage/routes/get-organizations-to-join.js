export default function (schema, request) {
  const { code } = request.params;
  return schema.organizationsToJoin.findOrCreateBy({ code });
}
