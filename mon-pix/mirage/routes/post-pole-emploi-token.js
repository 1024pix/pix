export default function (schema) {
  const createdUser = schema.users.create({
    firstName: 'Johnny',
    lastName: 'Ive',
  });

  return {
    access_token:
      'aaa.' +
      btoa(
        `{"user_id":${createdUser.id},"source":"pole_emploi_connect","identity_provider":"POLE_EMPLOI","iat":1545321469,"exp":4702193958}`
      ) +
      '.bbb',
    user_id: createdUser.id,
  };
}
