export function findUsers(schema, request) {

  let users = schema.users;

  if (!request.queryParams) {
    return users;
  }

  if (request.queryParams.organizationId) {
    const organizationId = request.queryParams.organizationId;
    const memberships = schema.memberships.where({ organizationId });
    const userIds = memberships.models.map((membership) => membership.userId);
    users = users.find(userIds);
  }

  if (request.queryParams.email) {
    const email = request.queryParams.email;
    users = users.where({ email });
  }

  return users;
}
