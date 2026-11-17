export default function (schema, request) {
  const userId = request.params.id;
  const user = schema.users.find(userId);
  user.update({
    pixAppTermsOfServiceStatus: 'accepted',
  });

  return user;
}
