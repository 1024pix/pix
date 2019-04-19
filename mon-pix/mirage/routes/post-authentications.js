const simpleUserAuthentication = {
  data: {
    type: 'authentication',
    attributes: {
      'user-id': 1,
      token: 'aaa.' + btoa('{"user_id":1,"source":"pix","iat":1545321469,"exp":4702193958}') + '.bbb'
    },
    id: 1
  }
};

const simpleExternalUserAuthentication = {
  data: {
    type: 'authentication',
    attributes: {
      'user-id': 3,
      token: 'aaa.' + btoa('{"user_id":3,"source":"external","iat":1545321469,"exp":4702193958}') + '.bbb'
    },
    id: 3
  }
};
const prescriberAuthentication = {
  data: {
    type: 'authentication',
    attributes: {
      'user-id': 2,
      token: 'aaa.' + btoa('{"user_id":2,"source":"pix","iat":1545321469}') + '.bbb'
    },
    id: 2
  }
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

  const email = JSON.parse(request.requestBody).data.attributes.email;
  const token = JSON.parse(request.requestBody).data.attributes.token;

  if (email === 'jane@acme.com') return simpleUserAuthentication;

  if (email === 'john@acme.com') return prescriberAuthentication;

  const userId = JSON.parse(atob(token.split('.')[1])).user_id;
  if (userId === 3) return simpleExternalUserAuthentication;

  return badUser;
}
