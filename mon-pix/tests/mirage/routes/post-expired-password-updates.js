export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  const newPassword = params.data.attributes['new-password'];
  const passwordResetToken = params.data.attributes['password-reset-token'];
  const user = schema.users.findBy({ id: passwordResetToken });
  user.update({ password: newPassword, shouldChangePassword: false });

  return {
    data: {
      type: 'reset-expired-password-demands',
      attributes: {
        login: user.username,
      },
    },
  };
}
