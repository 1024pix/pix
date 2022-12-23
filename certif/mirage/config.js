import { Response } from 'miragejs';
import { uploadHandler } from 'ember-file-upload';
import { findPaginatedStudents } from './handlers/find-paginated-students';
import { findPaginatedSessionSummaries } from './handlers/find-paginated-session-summaries';

function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

export default function () {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0;

  this.get('/certification-centers/:certificationCenterId/sessions/:sessionId/students', findPaginatedStudents);

  this.post('/revoke', () => {});

  this.post('/token', (schema, request) => {
    const params = parseQueryString(request.requestBody);
    const foundUser = schema.certificationPointOfContacts.findBy({ email: params.username });

    if (foundUser && ['secret', 'Pa$$w0rd'].includes(params.password)) {
      return {
        expires_in: 3600,
        token_type: 'Bearer token type',
        access_token:
          'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        user_id: foundUser.id,
      };
    } else {
      return new Response([
        {
          status: '401',
          title: 'Unauthorized',
          detail: "L'adresse e-mail et/ou le mot de passe saisis sont incorrects.",
        },
      ]);
    }
  });

  this.post('/certification-centers/:certificationCenterId/session');

  this.get('/sessions/:id', function (schema, request) {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId);
  });

  this.get('/certification-centers/:id/members', function (schema) {
    return schema.members.all();
  });

  this.patch('/sessions/:id');

  this.get('/sessions/:id/certification-candidates', function (schema, request) {
    const sessionId = request.params.id;
    return schema.certificationCandidates.where({ sessionId });
  });

  this.post('/sessions/:id/certification-candidates', function (schema, request) {
    const sessionId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const translateBillingMode = (billingMode) => {
      if (billingMode === 'FREE') return 'Gratuite';
      if (billingMode === 'PAID') return 'Payante';
      if (billingMode === 'PREPAID') return 'Prépayée';
    };
    return schema.certificationCandidates.create({
      ...requestBody.data.attributes,
      sessionId,
      billingMode: translateBillingMode(requestBody.data.attributes['billing-mode']),
    });
  });

  this.post('/certification-reports/:id/certification-issue-reports', function (schema, request) {
    const certificationCourseId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const description = requestBody.data.attributes['description'];
    const category = requestBody.data.attributes['category'];
    const certificationReport = schema.certificationReports.find(certificationCourseId);

    return schema.certificationIssueReports.create({ certificationReport, description, category });
  });

  this.delete('/certification-issue-reports/:id', function (schema, request) {
    const certificationIssueReportId = request.params.id;
    const certificationIssueReport = schema.certificationIssueReports.find(certificationIssueReportId);

    certificationIssueReport.destroy();
    return { data: null };
  });

  this.get('/sessions/:id/certification-reports', function (schema, request) {
    const sessionId = request.params.id;

    return schema.sessions.find(sessionId).certificationReports;
  });

  this.delete('/sessions/:id/certification-candidates/:candidateId', function (schema, request) {
    const certificationCandidateId = request.params.candidateId;
    const certificationCandidate = schema.certificationCandidates.find(certificationCandidateId);
    if (certificationCandidate.isLinked) {
      return new Response(403);
    }

    certificationCandidate.destroy();
    return { data: null };
  });

  this.post(
    '/sessions/:id/certification-candidates/import',
    uploadHandler(function (schema, request) {
      const { name } = request.requestBody.file;
      if (name === 'invalid-file') {
        return new Response(
          422,
          { some: 'header' },
          {
            errors: [
              {
                code: 'INVALID_DOCUMENT',
                status: '422',
                title: 'Unprocessable Entity',
                detail: 'Une erreur personnalisée.',
              },
            ],
          }
        );
      }
      if (name === 'validation-error') {
        return new Response(
          422,
          { some: 'header' },
          {
            errors: [
              {
                status: '422',
                title: 'Unprocessable Entity',
                detail: 'Une erreur personnalisée.',
              },
            ],
          }
        );
      }
      if (name === 'forbidden-import') {
        return new Response(
          403,
          { some: 'header' },
          {
            errors: [
              {
                status: '403',
                title: 'Forbidden',
                detail: 'At least one candidate is already linked to a user',
              },
            ],
          }
        );
      }
      if (name.endsWith('addTwoCandidates')) {
        const sessionId = name.split('.')[0];
        const certificationCandidates = schema.certificationCandidates.where({ sessionId });
        certificationCandidates.destroy();
        server.createList('certification-candidate', 2, { isLinked: false, sessionId });
      }
      return new Response(204);
    })
  );

  this.put('/sessions/:id/enroll-students-to-session', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const sessionId = request.params.id;
    const studentListToAdd = requestBody.data.attributes['organization-learner-ids'];
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

  this.get('/certification-point-of-contacts/me', (schema, request) => {
    const userToken = request.requestHeaders['Authorization'].replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;
    return schema.certificationPointOfContacts.find(userId);
  });

  this.patch('/users/:id/pix-certif-terms-of-service-acceptance', (schema, request) => {
    const certificationPointOfContactId = request.params.id;
    const certificationPointOfContact = schema.certificationPointOfContacts.find(certificationPointOfContactId);
    certificationPointOfContact.update({ pixCertifTermsOfServiceAccepted: true });

    return new Response(204);
  });

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.get('/certification-centers/:id/divisions', (schema, _) => {
    return schema.divisions.all();
  });

  this.get('/certification-centers/:id/session-summaries', findPaginatedSessionSummaries);

  this.get('/countries', (schema, _) => {
    return schema.countries.all();
  });

  this.get('/sessions/:id/supervising', async (schema, request) => {
    const sessionId = request.params.id;
    return schema.sessionForSupervisings.find(sessionId);
  });

  this.post('/sessions/supervise', () => {
    return new Response(204);
  });

  this.post('/certification-candidates/:id/authorize-to-start', async (schema, request) => {
    const candidateId = request.params.id;
    const payload = JSON.parse(request.requestBody);
    const authorizedToStart = payload['authorized-to-start'];
    const candidate = schema.certificationCandidateForSupervisings.find(candidateId);
    await candidate.update({ authorizedToStart });
    return new Response(204);
  });

  this.post('/certification-candidates/:id/authorize-to-resume', async (schema, request) => {
    const candidateId = request.params.id;
    const candidate = schema.certificationCandidateForSupervisings.find(candidateId);
    await candidate.update({ authorizedToStart: true });
    return new Response(204);
  });

  this.delete('/sessions/:id', async () => {
    return new Response(204);
  });

  this.post('certif/certification-centers/:id/update-referer', async (schema, request) => {
    const payload = JSON.parse(request.requestBody);
    const memberId = payload.data.attributes.userId;
    const member = schema.members.find(memberId);
    await member.update({ isReferer: true });
    return new Response(204);
  });

  this.get('/certification-center-invitations/:id', (schema, request) => {
    const certificationCenterInvitationId = request.params.id;
    const code = request.queryParams?.code;

    switch (code) {
      case 'CANCELLED':
        return new Response(403, {}, { errors: [{ status: '403' }] });
      case 'ACCEPTED':
        return new Response(412, {}, { errors: [{ status: '412' }] });
      default:
        return schema.certificationCenterInvitations.find(certificationCenterInvitationId);
    }
  });

  this.post('/certification-center-invitations/:id/accept', (schema) => {
    const certificationPointOfContact = schema.certificationPointOfContacts.first();
    const allowedCertificationCenterAccess = schema.allowedCertificationCenterAccesses.create({
      name: 'Collège Truffaut',
      type: 'SCO',
      externalId: 'ABC123',
      isRelatedToManagingStudentsOrganization: false,
      isAccessBlockedCollege: false,
      isAccessBlockedLycee: false,
      isAccessBlockedAEFE: false,
      isAccessBlockedAgri: false,
    });

    certificationPointOfContact.update({ allowedCertificationCenterAccesses: [allowedCertificationCenterAccess] });

    return new Response(204);
  });

  this.post('/certification-centers/:id/sessions/import', async (schema, request) => {
    const { type } = request.requestBody;
    const { id: certificationCenterId } = request.params;

    if (type === 'valid-file') {
      await schema.sessionSummaries.create({ certificationCenterId });
      await schema.sessionSummaries.create({ certificationCenterId });
    }

    if (type === 'invalid-file') {
      return new Response(
        422,
        { some: 'header' },
        {
          errors: [
            {
              code: 'INVALID_DOCUMENT',
              status: '422',
              title: 'Unprocessable Entity',
              detail: 'Une erreur personnalisée.',
            },
          ],
        }
      );
    }
    return new Response(200);
  });

  this.post('/users', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const attributes = requestBody.data.attributes;
    const user = {
      firstName: attributes['first-name'],
      lastName: attributes['last-name'],
      email: attributes.email,
      password: 'secret',
    };

    schema.certificationPointOfContacts.create({ id: 12345, ...user });

    return schema.users.create({
      id: 12345,
      ...user,
      cgu: attributes.cgu,
    });
  });
}
