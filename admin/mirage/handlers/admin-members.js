export function createAdminMember(schema, request) {
  const payload = JSON.parse(request.requestBody);
  const { email, role } = payload.data.attributes;
  const user = schema.users.findBy({ email });

  return schema.create('admin-member', {
    userId: user.id,
    role,
    email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
