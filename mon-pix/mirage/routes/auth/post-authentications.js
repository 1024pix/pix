import Response from 'ember-cli-mirage/response';

function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

export default function(schema, request) {
  const queryParams = parseQueryString(request.requestBody);
  let foundUser = schema.users.findBy({ email: queryParams.username });
  if (!foundUser) {
    foundUser = schema.users.findBy({ username: queryParams.username });
  }

  if (foundUser && queryParams.password === foundUser.password) {
    return {
      token_type: '',
      expires_in: '',
      access_token: 'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      user_id: foundUser.id
    };
  }
  return new Response(401, {}, 'Authentication failed');
}
