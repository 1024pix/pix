import { Response } from 'miragejs';

function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

export default function (schema, request) {
  const queryParams = parseQueryString(request.requestBody);

  if (queryParams.username === 'user.blocked@example.net') {
    return new Response(403, {}, 'USER_IS_BLOCKED');
  }

  if (queryParams.username == 'user.temporary-blocked@example.net') {
    return new Response(403, {}, 'USER_IS_TEMPORARY_BLOCKED');
  }

  let foundUser = schema.users.findBy({ email: queryParams.username });
  if (!foundUser) {
    foundUser = schema.users.findBy({ username: queryParams.username });
  }

  if (foundUser && queryParams.password === foundUser.password) {
    if (!foundUser.shouldChangePassword) {
      return {
        token_type: '',
        expires_in: '',
        access_token:
          'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        user_id: foundUser.id,
      };
    }
    return new Response(
      401,
      {},
      {
        errors: [{ title: 'PasswordShouldChange', code: 'SHOULD_CHANGE_PASSWORD', meta: foundUser.id }],
      }
    );
  }
  return new Response(401, {}, 'Authentication failed');
}
