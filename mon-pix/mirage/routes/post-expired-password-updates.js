export default function(schema, request) {
  const params = JSON.parse(request.requestBody);
  const { username, expiredPassword, newPassword } = params.data.attributes;

  const foundUser = schema.users.findBy({ username, password: expiredPassword });

  if (foundUser) {
    foundUser.update({ password: newPassword, shouldChangePassword: false });
    return { data: { type: 'reset-expired-password-demands' } };
  }
}
