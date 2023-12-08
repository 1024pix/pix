import { applyEmberDataSerializers, discoverEmberDataModels } from 'ember-cli-mirage';
import { Response, createServer } from 'miragejs';

import {
  attachOrganizationsFromExistingTargetProfile,
  attachTargetProfiles,
  attachTargetProfileToOrganizations,
  createTargetProfile,
  findOrganizationTargetProfileSummaries,
  findPaginatedTargetProfileOrganizations,
  findPaginatedFilteredTargetProfileSummaries,
  findTargetProfileBadges,
  updateTargetProfileStageCollection,
  outdate,
  updateTargetProfile,
  createBadge,
  markTargetProfileAsSimplifiedAccess,
} from './handlers/target-profiles';
import { createOrganizationMembership } from './handlers/organization-memberships';
import { createStage } from './handlers/stages';
import { findPaginatedAndFilteredSessions } from './handlers/find-paginated-and-filtered-sessions';
import {
  archiveOrganization,
  findPaginatedOrganizationMemberships,
  getOrganizationInvitations,
  getOrganizationPlaces,
  getOrganizationPlacesCapacity,
} from './handlers/organizations';
import { getPaginatedJuryCertificationSummariesBySessionId } from './handlers/get-jury-certification-summaries-by-session-id';
import { createAdminMember } from './handlers/admin-members';
import {
  attachTargetProfilesToTraining,
  createOrUpdateTrainingTrigger,
  createTraining,
  findPaginatedTrainingSummaries,
  getTraining,
  getTargetProfileSummariesForTraining,
  updateTraining,
} from './handlers/trainings';
import { findFrameworkAreas } from './handlers/frameworks';
import { getWithRequiredActionSessions } from './handlers/get-with-required-action-sessions';
import { getToBePublishedSessions } from './handlers/get-to-be-published-sessions';
import { findAutonomousCourseTargetProfiles, createAutonomousCourse } from './handlers/autonomous-courses';

export default function makeServer(config) {
  const finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(config.store), ...config.models },
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
    logging: true,
    urlPrefix: 'http://localhost:3000',
  };

  return createServer(finalConfig);
}

function routes() {
  this.namespace = 'api';

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.get('/admin/autonomous-courses/target-profiles', findAutonomousCourseTargetProfiles);
  this.post('/admin/autonomous-courses', createAutonomousCourse);

  this.get('/admin/campaigns/:id');
  this.get('/admin/campaigns/:id/participations', (schema) => {
    return schema.campaignParticipations.all();
  });

  this.get('/admin/admin-members', (schema) => {
    return schema.adminMembers.all();
  });
  this.post('/admin/admin-members', createAdminMember);
  this.get('/admin/admin-members/me', (schema, request) => {
    const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;
    return schema.adminMembers.findBy({ userId });
  });
  this.patch('/admin/admin-members/:id', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const role = requestBody.data.attributes.role;
    const id = request.params.id;
    const adminMember = schema.adminMembers.findBy({ id });
    return adminMember.update({ role });
  });
  this.put('/admin/admin-members/:id/deactivate', () => {});

  this.get('/admin/sessions', findPaginatedAndFilteredSessions);
  this.get('/admin/sessions/to-publish', getToBePublishedSessions);
  this.get('/admin/sessions/with-required-action', getWithRequiredActionSessions);
  this.patch('/admin/sessions/:id/publish', () => {
    return new Response(204);
  });
  this.get('/admin/sessions/:id');
  this.get('/admin/sessions/:id/jury-certification-summaries', getPaginatedJuryCertificationSummariesBySessionId);
  this.put('/admin/sessions/:id/results-sent-to-prescriber', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ resultsSentToPrescriberAt: new Date() });
    return session;
  });
  this.post('/admin/sessions/publish-in-batch', () => {
    return new Response(200);
  });
  this.get('/admin/sessions/:id/generate-results-download-link', {
    sessionResultsLink: 'http://link-to-results.fr?lang=fr',
  });

  this.get('/admin/users');
  this.get('/admin/users/:id');
  this.get('/admin/users/:id/participations', (schema) => {
    return schema.userParticipations.all();
  });
  this.patch('/admin/users/:id', (schema, request) => {
    const userId = request.params.id;
    const {
      'first-name': firstName,
      'last-name': lastName,
      email,
      username,
      lang,
    } = JSON.parse(request.requestBody).data.attributes;
    const user = schema.users.find(userId);
    return user.update({ firstName, lastName, email, username, lang });
  });
  this.put('/admin/users/:id/unblock', (schema, request) => {
    const userId = request.params.id;
    const user = schema.users.findBy({ id: userId });
    const userLogin = schema.userLogins.findBy({ id: user.userLoginId });
    return userLogin.update({
      blockedAt: null,
      temporaryBlockedUntil: null,
      failureCount: 0,
    });
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

    if (type === 'OIDC_PARTNER') {
      const authenticationMethod = schema.authenticationMethods.findBy({ identityProvider: 'OIDC_PARTNER' });
      authenticationMethod.destroy();
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
        },
      );
    }

    const user = schema.users.findBy({ id: userId });
    const newAuthenticationMethod = schema.create('authentication-method', { identityProvider: 'PIX' });
    const authenticationMethods = [...user.authenticationMethods.models, newAuthenticationMethod];
    user.update({ email: email });
    user.update({ authenticationMethods });

    return user;
  });
  this.post('/admin/users/:userId/authentication-methods/:authenticationMethodId', (schema, request) => {
    const authenticationMethodId = request.params.authenticationMethodId;
    const authenticationMethod = schema.authenticationMethods.findBy({ id: authenticationMethodId });
    authenticationMethod.destroy();
    return new Response(204);
  });

  this.get('/admin/certification-centers');
  this.get('/admin/certification-centers/:id');
  this.get('/admin/certification-centers/:id/certification-center-memberships', (schema, request) => {
    const certificationCenterId = request.params.id;
    return schema.certificationCenterMemberships.where({ certificationCenterId });
  });
  this.post('/admin/certification-centers', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const name = params.data.attributes.name;
    const type = params.data.attributes.type;
    const externalId = params.data.attributes.externalId;

    return schema.certificationCenters.create({ name, type, externalId });
  });
  this.post('/admin/certification-centers/:id/certification-center-memberships', (schema, request) => {
    const certificationCenterId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const { email } = params;
    const certificationCenter = schema.certificationCenters.findBy({ id: certificationCenterId });
    const user = schema.users.create({ email, firstName: 'Jacques', lastName: 'Use' });

    return schema.certificationCenterMemberships.create({
      certificationCenter,
      createdAt: new Date(),
      role: 'MEMBER',
      user,
    });
  });
  this.get('/admin/certification-centers/:id/invitations', (schema, request) => {
    const certificationCenterId = request.params.id;
    return schema.certificationCenterInvitations.where({ certificationCenterId });
  });
  this.post('/admin/certification-centers/:id/invitations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;
    const lang = params.data.attributes.lang;
    const updatedAt = Date.now();
    return schema.certificationCenterInvitations.create({ email, lang, updatedAt });
  });
  this.delete('/admin/certification-center-invitations/:id', (schema, request) => {
    const certificationCenterInvitationId = request.params.id;
    schema.db.certificationCenterInvitations.remove(certificationCenterInvitationId);
    return new Response(204);
  });
  this.delete('/admin/certification-center-memberships/:id', (schema, request) => {
    const certificationCenterMembershipId = request.params.id;
    schema.db.certificationCenterMemberships.remove(certificationCenterMembershipId);
    return new Response(204);
  });
  this.patch('/admin/certification-center-memberships/:id', (schema, request) => {
    const certificationCenterMembershipId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const role = requestBody.data.attributes.role;
    const certificationCenterMembership = schema.certificationCenterMemberships.findBy({
      id: certificationCenterMembershipId,
    });
    const user = schema.users.findBy({ id: certificationCenterMembership.userId });
    const userFullName = `${user.firstName} ${user.lastName}`;

    if (userFullName === 'Gilles Parbal') {
      return new Response(500);
    }

    certificationCenterMembership.role = role;

    return certificationCenterMembership;
  });

  this.post('/admin/memberships', createOrganizationMembership);
  this.patch('/admin/memberships/:id', (schema, request) => {
    const organizationMembershipId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const organizationRole = params.data.attributes['organization-role'];

    const organizationMembership = schema.organizationMemberships.findBy({ id: organizationMembershipId });
    return organizationMembership.update({ organizationRole });
  });
  this.post('/admin/memberships/:id/disable', (schema, request) => {
    const organizationMembershipId = request.params.id;

    const organizationMembership = schema.organizationMemberships.findBy({ id: organizationMembershipId });
    return organizationMembership.update({ disabledAt: new Date() });
  });

  this.get('/admin/organizations');
  this.post('/admin/organizations', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const attributes = requestBody.data.attributes;

    const organization = {
      name: attributes.name,
      type: attributes.type,
      credit: attributes.credit,
      dataProtectionOfficerFirstName: attributes['data-protection-officer-first-name'],
      dataProtectionOfficerLastName: attributes['data-protection-officer-last-name'],
      dataProtectionOfficerEmail: attributes['data-protection-officer-email'],
    };

    return schema.create('organization', organization);
  });
  this.post('/admin/organizations/import-csv', async () => new Response(204));
  this.get('/admin/organizations/:id');
  this.get('/admin/organizations/:id/memberships', findPaginatedOrganizationMemberships);
  this.get('/admin/organizations/:id/target-profile-summaries', findOrganizationTargetProfileSummaries);
  this.post('/admin/organizations/:id/attach-target-profiles', attachTargetProfiles);
  this.get('/admin/organizations/:id/invitations', getOrganizationInvitations);
  this.get('/admin/organizations/:id/places', getOrganizationPlaces);
  this.get('/admin/organizations/:id/places/capacity', getOrganizationPlacesCapacity);
  this.post('/admin/organizations/:id/archive', archiveOrganization);

  this.get('/admin/frameworks');
  this.get('/admin/frameworks/:id/areas', findFrameworkAreas);

  this.post('/admin/target-profiles', createTargetProfile);
  this.get('/admin/target-profiles/:id');
  this.get('/admin/target-profiles/:id/organizations', findPaginatedTargetProfileOrganizations);
  this.post('/admin/target-profiles/:id/attach-organizations', attachTargetProfileToOrganizations);
  this.post('/admin/target-profiles/:id/copy-organizations', attachOrganizationsFromExistingTargetProfile);
  this.get('/admin/target-profiles/:id/badges', findTargetProfileBadges);
  this.patch('/admin/stage-collections/:id', updateTargetProfileStageCollection);
  this.patch('/admin/target-profiles/:id', updateTargetProfile);
  this.put('/admin/target-profiles/:id/outdate', outdate);
  this.post('/admin/target-profiles/:id/badges', createBadge);
  this.put('/admin/target-profiles/:id/simplified-access', markTargetProfileAsSimplifiedAccess);
  this.get('/admin/target-profiles/:id/training-summaries', findPaginatedTrainingSummaries);

  this.get('/admin/target-profile-summaries', findPaginatedFilteredTargetProfileSummaries);

  this.patch('/admin/badges/:id');

  this.post('/admin/stages', createStage);
  this.patch('/admin/stages/:id');

  this.get('/admin/training-summaries', findPaginatedTrainingSummaries);
  this.post('/admin/trainings', createTraining);
  this.get('/admin/trainings/:id', getTraining);
  this.patch('/admin/trainings/:id', updateTraining);
  this.get('/admin/trainings/:id/target-profile-summaries', getTargetProfileSummariesForTraining);
  this.post('/admin/trainings/:id/attach-target-profiles', attachTargetProfilesToTraining);
  this.put('/admin/trainings/:id/triggers', createOrUpdateTrainingTrigger);

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

  this.post('/admin/organizations/:id/invitations', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;
    const lang = params.data.attributes.lang;
    const role = params.data.attributes.role;
    const updatedAt = Date.now();
    return schema.organizationInvitations.create({ email, lang, role, updatedAt });
  });
  this.delete('/admin/organizations/:id/invitations/:invitation-id', (schema, request) => {
    const organizationInvitationId = request.params['invitation-id'];

    const invitation = schema.organizationInvitations.find(organizationInvitationId);
    invitation.status = 'cancelled';

    return invitation;
  });
  this.patch('/admin/organizations/:id');

  this.delete('/admin/campaign-participations/:id', (schema, request) => {
    const participationId = request.params.id;
    const participation = schema.userParticipations.find(participationId);
    participation.update({
      deletedAt: new Date('2012-12-12'),
      deletedByFullName: 'Terry Dicule',
    });

    return new Response(204);
  });

  this.delete('/admin/organization-learners/:id/association', (schema, request) => {
    const organizationLearnerId = request.params.id;
    schema.db.organizationLearners.remove(organizationLearnerId);
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

  this.get('admin/complementary-certifications', (schema) => {
    return schema.complementaryCertifications.all();
  });

  this.get('admin/complementary-certifications/:id/target-profiles', (schema, request) => {
    return schema.complementaryCertifications.find(request.params.id);
  });

  this.get('admin/complementary-certifications/attachable-target-profiles', (schema, request) => {
    const targetProfileId = parseInt(request.queryParams.searchTerm);
    const targetProfile = schema.attachableTargetProfiles.find(targetProfileId);

    return {
      data: [
        {
          type: 'attachable-target-profile',
          id: targetProfile.id,
          attributes: {
            name: targetProfile.name,
          },
        },
      ],
    };
  });

  this.put('admin/complementary-certifications/:id/badges', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const {
      ['badge-id']: badgeId,
      level,
      ['image-url']: imageUrl,
      label,
    } = params.data.attributes['complementary-certification-badges'][0].data.attributes;

    const complementaryCertification = schema.complementaryCertifications.find(request.params.id);
    complementaryCertification.update({
      targetProfilesHistory: [
        {
          id: 3,
          name: 'ALEX TARGET',
          badges: [
            {
              id: badgeId,
              label,
              level,
              imageUrl,
            },
          ],
        },
      ],
    });

    return new Response(204);
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
    certificationToUpdate.update({ isCancelled: true });

    return new Response(200);
  });

  this.post('/admin/certification-courses/:id/uncancel', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ isCancelled: false });

    return new Response(200);
  });

  this.post('/admin/certification-courses/:id/assessment-results/', () => {
    return new Response(204);
  });

  this.get('/admin/tags');
  this.post('/admin/tags', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const tagName = params.data.attributes.name;
    return schema.create('tag', { name: tagName });
  });

  this.post('/admin/campaigns', async () => new Response(204));

  this.get('/admin/oidc/identity-providers', () => {
    return {
      data: [
        {
          type: 'oidc-identity-providers',
          id: 'oidc-partner',
          attributes: {
            code: 'OIDC_PARTNER',
            'organization-name': 'Partenaire OIDC',
            'has-logout-url': false,
            source: 'oidc-externe',
          },
        },
      ],
    };
  });
}
