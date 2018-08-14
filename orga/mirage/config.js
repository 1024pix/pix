import Response from 'ember-cli-mirage/response';

function parseQueryString(queryString) {
  let result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

export default function() {

  this.urlPrefix = 'http://localhost:3000';
  this.namespace = '/api';
  this.timing = 0;

  this.post('/token', (schema, request) => {
    const params = parseQueryString(request.requestBody);
    const foundUser = schema.users.findBy({ email: params.username });

    if (foundUser && params.password == 'secret') {
      return {
        token_type: '',
        expires_in: '',
        access_token: 'token',
        user_id: foundUser.id
      };
    } else {
      return new Response(401, {}, 'Authentication failed');
    }
  });
  this.post('/revoke', () => {});

  this.get('/users/:id');
  this.get('/users/:id/organization-accesses', (schema, request) => {
    const userId = request.params.id;
    return schema.organizationAccesses.where({ userId });
  });
  this.post('/campaigns');
  this.get('/organizations/:id/campaigns', (schema) => {
    return schema.campaigns.all();
  });
}
