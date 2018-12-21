const simpleUserAuthentication = {
  data: {
    type: 'authentication',
    attributes: {
      'user-id': 1,
      token: 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUyMTg5MDh9.bbbb'
    },
    id: 1
  }
};

const simpleExternalUserAuthentication = {
  data: {
    type: 'authentication',
    attributes: {
      'user-id': 3,
      token: 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJleHRlcm5hbCIsImlhdCI6MTU0NTMyMTQ2OSwiZXhwIjoxNTQ1OTI2MjY5fQ.bbbb'
    },
    id: 3
  }
};
const prescriberAuthentication = {
  data: {
    type: 'authentication',
    attributes: {
      'user-id': 2,
      token: 'aaa.eyJ1c2VyX2lkIjoyLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUyMTg4Nzl9.bbbb'
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

  if (token === 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJleHRlcm5hbCIsImlhdCI6MTU0NTMyMTQ2OSwiZXhwIjoxNTQ1OTI2MjY5fQ.bbbb') return simpleExternalUserAuthentication;

  return badUser;
}
