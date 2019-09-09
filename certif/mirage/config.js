import Response from 'ember-cli-mirage/response';
import { upload } from 'ember-file-upload/mirage';

function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

export default function() {

  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0;

  this.post('/token', (schema, request) => {
    const params = parseQueryString(request.requestBody);
    const foundUser = schema.users.findBy({ email: params.username });

    if (foundUser && params.password === 'secret') {
      return {
        token_type: '',
        expires_in: '',
        access_token: 'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        user_id: foundUser.id
      };
    } else {
      return new Response(401, {}, 'Authentication failed');
    }
  });

  this.post('/revoke', () => {});

  this.get('/users/me', (schema, request) => {
    const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;

    return schema.users.find(userId);
  });

  this.patch('/users/:id');

  this.patch('/users/:id/accept-pix-certif-terms-of-service', (schema, request) => {
    const user =  schema.users.find(request.params.id);
    user.pixCertifTermsOfServiceAccepted = true;
    return user;
  });

  this.get('/users/:id/certification-center-memberships', (schema, request) => {
    const userId = request.params.id;
    return schema.certificationCenterMemberships.where({ userId });
  });

  this.get('/certification-centers/:id/sessions', (schema) => {
    return schema.sessions.all();
  });

  this.post('/sessions');

  this.get('/sessions/:id');

  this.patch('/sessions/:id');
  
  this.post('/sessions/:id/certification-candidates/import', upload(function(_, request) {
    const { name } = request.requestBody.file;
    return name === 'invalid-file'
      ? new Response(422)
      : new Response(204);
  }));
}
