import Response from 'ember-cli-mirage/response';
import { upload } from 'ember-file-upload/mirage';
import { findPaginatedStudents } from './handlers/find-paginated-students';

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

  this.get('/certification-centers/:certificationCenterId/sessions/:sessionId/students', findPaginatedStudents);

  this.post('/revoke', () => {});

  this.post('/token', (schema, request) => {
    const params = parseQueryString(request.requestBody);
    const foundUser = schema.certificationPointOfContacts.findBy({ email: params.username });

    if (foundUser && params.password === 'secret') {
      return {
        token_type: '',
        expires_in: '',
        access_token: 'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        user_id: foundUser.id,
      };
    } else {
      return new Response([{ 'status': '401', 'title': 'Unauthorized', 'detail': 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.' }]);
    }
  });

  this.post('/sessions');

  this.get('/sessions/:id', (schema, request) => {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId);
  });

  this.patch('/sessions/:id');

  this.get('/sessions/:id/certification-candidates', (schema, request) => {
    const sessionId = request.params.id;
    return schema.certificationCandidates.where({ sessionId });
  });

  this.post('/sessions/:id/certification-candidates', (schema, request) => {
    const sessionId = request.params.id;
    return schema.certificationCandidates.create({ sessionId });
  });

  this.post('/certification-reports/:id/certification-issue-reports', (schema, request) => {
    const certificationCourseId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const description = requestBody.data.attributes['description'];
    const category = requestBody.data.attributes['category'];
    const certificationReport = schema.certificationReports.find(certificationCourseId);

    return schema.certificationIssueReports.create({ certificationReport, description, category });
  });

  this.delete('/certification-issue-reports/:id', (schema, request) => {
    const certificationIssueReportId = request.params.id;
    const certificationIssueReport = schema.certificationIssueReports.find(certificationIssueReportId);

    certificationIssueReport.destroy();
    return { data: null };
  });

  this.get('/sessions/:id/certification-reports', (schema, request) => {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId).certificationReports;
  });

  this.delete('/sessions/:id/certification-candidates/:candidateId', (schema, request) => {
    const certificationCandidateId = request.params.candidateId;
    const certificationCandidate = schema.certificationCandidates.find(certificationCandidateId);
    if (certificationCandidate.isLinked) {
      return new Response(403);
    }

    certificationCandidate.destroy();
    return { data: null };
  });

  this.post('/sessions/:id/certification-candidates/import', upload((schema, request) => {
    const { name } = request.requestBody.file;
    if (name === 'invalid-file') {
      return new Response(422, { some: 'header' }, { errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Une erreur personnalisée' }] });
    }
    if (name === 'forbidden-import') {
      return new Response(403, { some: 'header' }, { errors: [{ status: '403', title: 'Forbidden', detail: 'At least one candidate is already linked to a user' }] });
    }
    if (name.endsWith('addTwoCandidates')) {
      const sessionId = name.split('.')[0];
      const certificationCandidates = schema.certificationCandidates.where({ sessionId });
      certificationCandidates.destroy();
      server.createList('certification-candidate', 2, { isLinked: false, sessionId });
    }
    return new Response(204);
  }));

  this.put('/sessions/:id/enroll-students-to-session', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const sessionId = request.params.id;
    const studentListToAdd = requestBody.data.attributes['student-ids'];
    const numberOfStudents = studentListToAdd.length;
    if (numberOfStudents > 0) {
      server.createList('certification-candidate', numberOfStudents, { sessionId });
      return schema.certificationCandidates.all();
    }
    return new Response(204);
  });

  this.put('/sessions/:id/finalization', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.find(sessionId);
    session.update({ status: 'finalized' });

    return session;
  });

  this.get('/certification-point-of-contacts/:id', (schema, request) => {
    const certificationPointOfContactId = request.params.id;
    const userToken = request.requestHeaders['Authorization'].replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;
    if (parseInt(certificationPointOfContactId) !== parseInt(userId)) {
      return new Response(403, { some: 'header' }, { errors: [{ status: '403', title: 'Forbidden', detail: 'Authenticated user different from the one asked' }] });
    }

    return schema.certificationPointOfContacts.find(certificationPointOfContactId);
  });

  this.patch('/users/:id/pix-certif-terms-of-service-acceptance', (schema, request) => {
    const certificationPointOfContactId = request.params.id;
    const certificationPointOfContact = schema.certificationPointOfContacts.find(certificationPointOfContactId);
    certificationPointOfContact.update({ pixCertifTermsOfServiceAccepted: true });

    return certificationPointOfContact;
  });

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.get('/certification-centers/:id/divisions', (schema, _) => {
    return schema.divisions.all();
  });
}
