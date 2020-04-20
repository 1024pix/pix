import { createMembership } from './handlers/memberships';
import { getOrganizationMemberships } from './handlers/organizations';
import { attachTargetProfiles, getOrganizationTargetProfiles } from './handlers/target-profiles';
import { getCertificationsBySessionId } from './handlers/certifications-by-session-id';
import { findPaginatedAndFilteredSessions } from './handlers/find-paginated-and-filtered-sessions';
import { upload } from 'ember-file-upload/mirage';

export default function() {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';

  this.get('/jury/sessions', findPaginatedAndFilteredSessions);
  this.get('/jury/sessions/:id');
  this.get('/jury/sessions/:id/certifications', getCertificationsBySessionId);
  this.put('/jury/sessions/:id/results-sent-to-prescriber', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ resultsSentToPrescriberAt: new Date() });
    return session;
  });
  this.get('admin/certification-officer/:id');

  this.get('/users');
  this.get('/admin/users/:id');
  this.get('/certification-centers');
  this.get('/certification-centers/:id');

  this.post('/memberships', createMembership);
  this.get('/organizations');
  this.get('/organizations/:id');
  this.get('/organizations/:id/memberships', getOrganizationMemberships);
  this.get('/organizations/:id/target-profiles', getOrganizationTargetProfiles);
  this.post('/organizations/:id/target-profiles', attachTargetProfiles);

  this.get('/admin/certifications/:id');

  this.put('/sessions/:id/certifications/attendance-sheet-analysis', upload(function() {
    return [
      { lastName: 'Lantier',
        firstName: 'Étienne',
        birthdate: '1990-01-04',
        birthplace: 'Ajaccio',
        email: null,
        externalId: 'ELAN123',
        extraTimePercentage: null,
        signature: 'x',
        certificationId: '2',
        lastScreen: 'x',
        comments: null,
      },
      { lastName: 'Ranou',
        firstName: 'Liam',
        birthdate: '2000-10-22',
        birthplace: null,
        email: null,
        externalId: null,
        extraTimePercentage: null,
        signature: null,
        certificationId: '3',
        lastScreen: 'x',
        comments: 'Commentaire',
      }];
  }));

  this.post('/organizations/:id/invitations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;

    schema.organizationInvitations.create({ email });

    return schema.organizationInvitations.where({ email });
  });
}
