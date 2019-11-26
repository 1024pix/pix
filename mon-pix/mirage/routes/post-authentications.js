function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

const simpleUserAuthentication = {
  token_type: 'bearer',
  expires_in: '',
  access_token: 'aaa.' + btoa('{"user_id":1,"source":"mon-pix","iat":1545321469,"exp":4702193958}') + '.bbb',
  user_id: 1
};

const prescriberAuthentication = {
  token_type: 'bearer',
  expires_in: '',
  access_token: 'aaa.' + btoa('{"user_id":2,"source":"mon-pix","iat":1545321469}') + '.bbb',
  user_id: 2
};

const simpleExternalUserAuthentication = {
  token_type: 'bearer',
  expires_in: '',
  access_token: 'aaa.' + btoa('{"user_id":3,"source":"external","iat":1545321469,"exp":4702193958}') + '.bbb',
  user_id: 3
};

const badUser = {
  errors: [
    { status:'400',
      title:'Invalid Payload',
      detail: 'L\'adresse e-mail et/ou le mot de passe saisi(s) sont incorrects.'
    }
  ]
};

export default function(schema, request) {
  const params = parseQueryString(request.requestBody);
  const { username:email, password, token } = params;

  if (email === 'jane@acme.com' && password === 'Jane1234')  {
    return simpleUserAuthentication;
  }

  if (email === 'john@acme.com' && password === 'John1234') {
    return prescriberAuthentication;
  }

  const userId = JSON.parse(atob(token.split('.')[1])).user_id;
  if (userId === 3) return simpleExternalUserAuthentication;

  return badUser;
}
