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

  this.get('/certification-centers/:id/sessions', (schema, request) => {
    const certificationCenterId = request.params.id;

    return schema.sessions.where({ certificationCenterId });
  });

  this.post('/revoke', () => {});

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
      return new Response([{ 'status' : '401', 'title' : 'Unauthorized' , 'detail' : 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.' }]);
    }
  });

  this.post('/sessions');

  this.get('/sessions/:id', function(schema, request) {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId);
  });

  this.patch('/sessions/:id');

  this.get('/sessions/:id/certification-candidates', function(schema, request) {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId).certificationCandidates;
  });

  this.post('/sessions/:id/certification-candidates', function(schema) {
    return schema.certificationCandidates.create();
  });

  this.get('/sessions/:id/certification-reports', function(schema, request) {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId).certificationReports;
  });

  this.delete('/sessions/:id/certification-candidates/:candidateId', function(schema, request) {
    const certificationCandidateId = request.params.candidateId;

    const certificationCandidate = schema.certificationCandidates.find(certificationCandidateId);
    if (certificationCandidate.isLinked) {
      return new Response(403);
    }

    certificationCandidate.destroy();
    return { data: null };
  });

  this.post('/sessions/:id/certification-candidates/import', upload(function(schema, request) {
    const { name } = request.requestBody.file;
    if (name === 'invalid-file') {
      return new Response(422, { some: 'header' }, { errors: [ 'generic error'] });
    }
    if (name === 'forbidden-import') {
      return new Response(403, { some: 'header' }, { errors: [{ status: '403', title: 'Forbidden', detail: 'At least one candidate is already linked to a user' }] });
    }
    if (name.endsWith('addTwoCandidates')) {
      const sessionId = name.split('.')[0];
      const newCandidates = server.createList('certification-candidate', 2, { isLinked: false });
      const session = schema.sessions.find(sessionId);
      session.update({ certificationCandidates: newCandidates });
    }
    return new Response(204);
  }));

  this.put('/sessions/:id/finalization', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.find(sessionId);
    session.update({ status: 'finalized' });

    return session;
  });

  this.get('/users/me', (schema, request) => {
    const userToken = request.requestHeaders.authorization.replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;

    return schema.users.find(userId);
  });

  this.get('/users/:id/certification-center-memberships', (schema, request) => {
    const userId = request.params.id;

    return schema.certificationCenterMemberships.where({ userId });
  });

  this.patch('/users/:id/pix-certif-terms-of-service-acceptance', (schema, request) => {
    const userId = request.params.id;
    const user = schema.users.find(userId);
    user.update({ pixCertifTermsOfServiceAccepted: true });

    return user;
  });
}
