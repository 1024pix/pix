import { createMembership } from './handlers/memberships';
import { getOrganizationMemberships } from './handlers/organizations';
import { attachTargetProfiles, getOrganizationTargetProfiles } from './handlers/target-profiles';
import { getCertificationsBySessionId } from './handlers/certifications-by-session-id';
import { findPaginatedAndFilteredSessions } from './handlers/find-paginated-and-filtered-sessions';

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

  this.get('/users');
  this.get('/users/me', (schema, request) => {
    const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;

    return schema.users.find(userId);
  });
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

  this.post('/organizations/:id/invitations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;

    schema.organizationInvitations.create({ email });

    return schema.organizationInvitations.where({ email });
  });
}
