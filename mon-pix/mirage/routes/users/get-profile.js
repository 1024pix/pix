export default function (schema, request) {
  const userId = request.params.id;
  const user = schema.users.find(userId);

  if (!user.profile) return schema.profiles.create({});

  return user.profile;
}
