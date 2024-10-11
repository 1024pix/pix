export default function (schema, request) {
  const userId = request.params.id;
  const user = schema.users.find(userId);

  if (!user.scorecards) return { data: null };

  return user.scorecards;
}
