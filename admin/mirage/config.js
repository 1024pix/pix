import { createMembership } from './handlers/memberships';
import { attachTargetProfiles, attachTargetProfileToOrganizations, getOrganizationTargetProfiles, findPaginatedTargetProfileOrganizations, updateTargetProfileName } from './handlers/target-profiles';
import { getJuryCertificationSummariesBySessionId } from './handlers/get-jury-certification-summaries-by-session-id';
import { findPaginatedAndFilteredSessions } from './handlers/find-paginated-and-filtered-sessions';
import { findPaginatedOrganizationMemberships } from './handlers/organizations';

export default function() {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';

  this.get('/admin/sessions', findPaginatedAndFilteredSessions);
  this.get('/admin/sessions/:id');
  this.get('/admin/sessions/:id/jury-certification-summaries', getJuryCertificationSummariesBySessionId);
  this.put('/admin/sessions/:id/results-sent-to-prescriber', (schema, request) => {
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
  this.get('/certification-centers/:id/certification-center-memberships', (schema, request) => {
    const certificationCenterId = request.params.id;
    return schema.certificationCenterMemberships.where({ certificationCenterId });
  });
  this.post('/certification-centers', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const name = params.data.attributes.name;
    const type = params.data.attributes.type;
    const externalId = params.data.attributes.externalId;

    return schema.certificationCenters.create({ name, type, externalId });
  });

  this.post('/memberships', createMembership);
  this.get('/organizations');
  this.get('/organizations/:id');
  this.get('/organizations/:id/memberships', findPaginatedOrganizationMemberships);
  this.get('/organizations/:id/target-profiles', getOrganizationTargetProfiles);
  this.post('/organizations/:id/target-profiles', attachTargetProfiles);
  this.post('/admin/target-profiles');
  this.get('/admin/target-profiles');
  this.get('/admin/target-profiles/:id');
  this.patch('/admin/target-profiles/:id');
  this.get('/admin/target-profiles/:id/organizations', findPaginatedTargetProfileOrganizations);
  this.post('/admin/target-profiles/:id/attach-organizations', attachTargetProfileToOrganizations);
  this.patch('/admin/target-profiles/:id', updateTargetProfileName);

  this.get('/admin/certifications/:id');

  this.post('/organizations/:id/invitations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;

    schema.organizationInvitations.create({ email });

    return schema.organizationInvitations.where({ email });
  });

  this.patch('/memberships/:id', (schema, request) => {
    const membershipId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const organizationRole = params.data.attributes['organization-role'];

    const membership = schema.memberships.findBy({ id: membershipId });
    return membership.update({ organizationRole });
  });

  this.post('/memberships/:id/disable', (schema, request) => {
    const membershipId = request.params.id;

    const membership = schema.memberships.findBy({ id: membershipId });
    return membership.update({ disabledAt: new Date() });
  });

  this.patch('/organizations/:id');

  this.patch('/admin/users/:id', (schema, request) => {
    const userId = request.params.id;
    const params = JSON.parse(request.requestBody);

    const userUpdated = {
      'data': {
        'type': 'users',
        'id': userId,
        'attributes': {
          'first-name': params.data.attributes['first-name'],
          'last-name': params.data.attributes['last-name'],
          'email': params.data.attributes['email'],
          'username': params.data.attributes['username'],
          'cgu': params.data.attributes['cgu'],
          'is-authenticated-from-gar': params.data.attributes['is-authenticated-from-gar'],
          'pix-orga-terms-of-service-accepted': params.data.attributes['pix-orga-terms-of-service-accepted'],
          'pix-certif-terms-of-service-accepted': params.data.attributes['pix-certif-terms-of-service-accepted'],
        },
      },
    };
    return userUpdated;
  });

  this.post('/admin/users/:id/anonymize', (schema, request) => {
    const userId = request.params.id;
    const expectedUpdatedUser = {
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
    };

    const user = schema.users.findBy({ id: userId });
    return user.update(expectedUpdatedUser);
  });

  this.patch('/admin/users/:id/dissociate', (schema, request) => {
    const userId = request.params.id;
    const expectedUpdatedUser = {
      schoolingRegistrations: [],
    };

    const user = schema.users.findBy({ id: userId });
    return user.update(expectedUpdatedUser);
  });

}
