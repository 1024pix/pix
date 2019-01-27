export function getOrganizationMemberships(schema, request) {

  const organizationId = request.params.id;

  return schema.memberships.where({ organizationId });
}
