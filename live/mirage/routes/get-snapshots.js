export default function(schema, request) {
  const organizationId = request.params.id;
  return schema.snapshots.where({ organizationId });
}
