export default function (schema, request) {
  const userId = request.params.id;
  const user = schema.users.find(userId);
  user.update({ mustValidateTermsOfService: false, lastTermsOfServiceValidatedAt: '2020-06-06' });

  return user;
}
