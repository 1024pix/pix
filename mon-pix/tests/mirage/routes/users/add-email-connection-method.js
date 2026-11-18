export default function (schema, request) {
  const userId = request.params.id;
  const user = schema.users.find(userId);

  user.update({ email: 'new-email@example.net', emailConfirmed: true });
  schema.authenticationMethods.create({ userId, identityProvider: 'PIX' });
  user.accountInfo.update({ canAddEmailConnectionMethod: false });

  return {
    data: {
      type: 'email-verification-codes',
      attributes: {
        email: 'new-email@example.net',
      },
    },
  };
}
