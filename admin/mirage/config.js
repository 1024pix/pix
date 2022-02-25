import {
  attachOrganizationsFromExistingTargetProfile,
  attachTargetProfiles,
  attachTargetProfileToOrganizations,
  findPaginatedTargetProfileOrganizations,
  findTargetProfileBadges,
  findTargetProfileStages,
  getOrganizationTargetProfiles,
  outdate,
  updateTargetProfile,
  createBadge,
  createBadgeCriterion,
  markTargetProfileAsSimplifiedAccess,
} from './handlers/target-profiles';

import { Response } from 'ember-cli-mirage';
import { createMembership } from './handlers/memberships';
import { getBadge } from './handlers/badges';
import { createStage } from './handlers/stages';
import { findPaginatedAndFilteredSessions } from './handlers/find-paginated-and-filtered-sessions';
import { findPaginatedOrganizationMemberships, getOrganizationInvitations } from './handlers/organizations';
import { getJuryCertificationSummariesBySessionId } from './handlers/get-jury-certification-summaries-by-session-id';

export default function () {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';

  this.get('/admin/campaigns/:id', (schema, request) => {
    return schema.campaigns.find(request.params.id);
  });

  this.get('/admin/campaigns/:id/participations', (schema) => {
    return schema.campaignParticipations.all();
  });

  this.get('/admin/sessions', findPaginatedAndFilteredSessions);
  this.get('/admin/sessions/to-publish', (schema) => {
    const toBePublishedSessions = schema.toBePublishedSessions.all();
    return toBePublishedSessions;
  });
  this.get('/admin/sessions/to-publish', (schema) => {
    const toBePublishedSessions = schema.toBePublishedSessions.all();
    return toBePublishedSessions;
  });
  this.get('/admin/sessions/with-required-action', (schema) => {
    const withRequiredActionSessions = schema.withRequiredActionSessions.all();
    return withRequiredActionSessions;
  });
  this.patch('/admin/sessions/:id/publish', () => {
    return new Response(204);
  });
  this.get('/admin/sessions/:id');
  this.get('/admin/sessions/:id/jury-certification-summaries', getJuryCertificationSummariesBySessionId);
  this.put('/admin/sessions/:id/results-sent-to-prescriber', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ resultsSentToPrescriberAt: new Date() });
    return session;
  });

  this.post('/admin/sessions/publish-in-batch', () => {
    return new Response(200);
  });

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.get('/users');
  this.get('/users/me', (schema, request) => {
    const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;

    return schema.users.find(userId);
  });

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
  this.post('/certification-centers/:id/certification-center-memberships', (schema, request) => {
    const certificationCenterId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const { email } = params;
    const certificationCenter = schema.certificationCenters.findBy({ id: certificationCenterId });
    const user = schema.users.create({ email });

    return schema.certificationCenterMemberships.create({
      certificationCenter,
      createdAt: new Date(),
      user,
    });
  });

  this.delete('/certification-center-memberships/:id', (schema, request) => {
    const certificationCenterMembershipId = request.params.id;
    schema.db.certificationCenterMemberships.remove(certificationCenterMembershipId);
    return new Response(204);
  });

  this.post('/admin/memberships', createMembership);
  this.get('/organizations');
  this.get('/organizations/:id');
  this.get('/organizations/:id/memberships', findPaginatedOrganizationMemberships);
  this.get('/organizations/:id/target-profiles', getOrganizationTargetProfiles);
  this.post('/organizations/:id/target-profiles', attachTargetProfiles);
  this.get('/admin/organizations/:id/invitations', getOrganizationInvitations);
  this.get('/admin/badges/:id', getBadge);
  this.post('/admin/badges/:id/badge-criteria', createBadgeCriterion);
  this.post('/admin/target-profiles');
  this.get('/admin/target-profiles');
  this.get('/admin/target-profiles/:id');
  this.get('/admin/target-profiles/:id/organizations', findPaginatedTargetProfileOrganizations);
  this.post('/admin/target-profiles/:id/attach-organizations', attachTargetProfileToOrganizations);
  this.post('/admin/target-profiles/:id/copy-organizations', attachOrganizationsFromExistingTargetProfile);
  this.get('/admin/target-profiles/:id/badges', findTargetProfileBadges);
  this.get('/admin/target-profiles/:id/stages', findTargetProfileStages);
  this.patch('/admin/target-profiles/:id', updateTargetProfile);
  this.put('/admin/target-profiles/:id/outdate', outdate);
  this.post('/admin/target-profiles/:id/badges', createBadge);

  this.post('/admin/stages', createStage);

  this.get('/admin/certifications/:id');

  this.get('/admin/certifications/:id/certified-profile', (schema, request) => {
    const id = request.params.id;
    return schema.certifiedProfiles.find(id);
  });

  this.get('/admin/certifications/:id/details', (schema, request) => {
    const id = request.params.id;
    return schema.certificationDetails.find(id);
  });

  this.post('/admin/certification/neutralize-challenge', () => {
    return new Response(204);
  });

  this.post('/admin/certification/deneutralize-challenge', () => {
    return new Response(204);
  });

  this.get('/admin/sessions/:id/generate-results-download-link', { sessionResultsLink: 'http://link-to-results.fr' });

  this.post('/admin/organizations/:id/invitations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;
    const lang = params.data.attributes.lang;
    const role = params.data.attributes.role;

    return schema.organizationInvitations.create({ email, lang, role });
  });

  this.patch('/admin/memberships/:id', (schema, request) => {
    const membershipId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const organizationRole = params.data.attributes['organization-role'];

    const membership = schema.memberships.findBy({ id: membershipId });
    return membership.update({ organizationRole });
  });

  this.post('/admin/memberships/:id/disable', (schema, request) => {
    const membershipId = request.params.id;

    const membership = schema.memberships.findBy({ id: membershipId });
    return membership.update({ disabledAt: new Date() });
  });

  this.patch('/organizations/:id');

  this.get('/admin/users/:id');

  this.patch('/admin/users/:id', (schema, request) => {
    const userId = request.params.id;
    const {
      'first-name': firstName,
      'last-name': lastName,
      email,
      username,
    } = JSON.parse(request.requestBody).data.attributes;

    const user = schema.users.find(userId);
    return user.update({ firstName, lastName, email, username });
  });

  this.post('/admin/users/:id/anonymize', (schema, request) => {
    const userId = request.params.id;
    const user = schema.users.findBy({ id: userId });
    return user.update({
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
      username: null,
      authenticationMethods: [],
    });
  });

  this.post('/admin/users/:id/remove-authentication', (schema, request) => {
    const userId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const type = params.data.attributes.type;

    if (type === 'EMAIL') {
      const authenticationMethod = schema.authenticationMethods.findBy({ identityProvider: 'PIX' });
      authenticationMethod.destroy();

      const user = schema.users.findBy({ id: userId });
      user.update({ email: null });
    }

    return new Response(204);
  });

  this.post('/admin/users/:id/add-pix-authentication-method', (schema, request) => {
    const userId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;

    const userHowHasAlreadyTheEmail = schema.users.findBy({ email });
    if (userHowHasAlreadyTheEmail) {
      return new Response(
        400,
        {},
        {
          errors: [
            {
              status: '400',
              code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
              title: 'Already existing email error',
            },
          ],
        }
      );
    }

    const user = schema.users.findBy({ id: userId });
    const newAuthenticationMethod = schema.create('authentication-method', { identityProvider: 'PIX' });
    const authenticationMethods = [...user.authenticationMethods.models, newAuthenticationMethod];
    user.update({ email: email });
    user.update({ authenticationMethods });

    return user;
  });

  this.put('/admin/users/:userId/authentication-methods/:authenticationMethodId/reassign', (schema, request) => {
    const userId = request.params.userId;
    const user = schema.users.findBy({ id: userId });
    user.update({ authenticationMethods: [] });
    return user;
  });

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.delete('/schooling-registration-user-associations/:id', (schema, request) => {
    const schoolingRegistrationId = request.params.id;
    schema.db.schoolingRegistrations.remove(schoolingRegistrationId);
    return new Response(204);
  });

  this.patch('/cache', () => {});
  this.post('/lcms/releases', () => {});

  this.patch('/certification-courses/:id', (schema, request) => {
    const certificationId = request.params.id;
    const params = JSON.parse(request.requestBody).data.attributes;

    const certificationToUpdate = schema.certifications.find(certificationId);

    const birthInseeCode =
      params['birth-country'] === 'FRANCE'
        ? params['birth-insee-code']
        : schema.countries.findBy({ name: params['birth-country'] }).code;
    certificationToUpdate.update({
      firstName: params['first-name'],
      lastName: params['last-name'],
      birthdate: params.birthdate,
      birthplace: params.birthplace,
      sex: params.sex,
      birthCountry: params['birth-country'],
      birthPostalCode: params['birth-postal-code'],
      birthInseeCode,
    });

    return certificationToUpdate;
  });

  this.get('/countries', (schema, _) => {
    return schema.countries.all();
  });

  this.get('/habilitations', (schema) => {
    return schema.habilitations.all();
  });

  this.put('/admin/sessions/:id/comment', (schema, request) => {
    const sessionToUpdate = schema.sessions.find(request.params.id);
    const params = JSON.parse(request.requestBody);
    sessionToUpdate.update({ juryComment: params['jury-comment'] });
    return new Response(204);
  });
  this.delete('/admin/sessions/:id/comment', async (schema, request) => {
    const sessionToUpdate = schema.sessions.find(request.params.id);
    sessionToUpdate.update({ juryComment: 'null' });
    return new Response(204);
  });

  this.post('/admin/certification-courses/:id/cancel', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ status: 'cancelled' });

    return new Response(200);
  });

  this.post('/admin/certification-courses/:id/uncancel', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ status: 'validated' });

    return new Response(200);
  });

  this.post('/admin/assessment-results/', () => {
    return new Response(204);
  });

  this.post('/admin/tags', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const tagName = params.data.attributes.name;
    return schema.create('tag', { name: tagName });
  });

  this.put('/admin/target-profiles/:id/simplified-access', markTargetProfileAsSimplifiedAccess);
}
