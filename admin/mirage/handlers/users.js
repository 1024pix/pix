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

  const email = request.queryParams['filter[email]'];
  if (email) {
    users = users.where({ email });
  }

  return users;
}
