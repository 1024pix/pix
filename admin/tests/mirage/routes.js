import { Response } from 'miragejs';
import { assessmentResultStatus } from 'pix-admin/models/certification';

import { createAdminMember } from './handlers/admin-members';
import { findPaginatedFilteredLearners } from './handlers/admin-organization-learners';
import {
  createAutonomousCourse,
  findAutonomousCourseTargetProfiles,
  getAutonomousCourseDetails,
  getPaginatedAutonomousCourses,
  updateAutonomousCourse,
} from './handlers/autonomous-courses';
import { updateBadgeCriterion } from './handlers/badge-criteria';
import { findPaginatedFilteredCampaignParticipations } from './handlers/campaign-participations';
import {
  findCertificationCenterAttachedOrganizations,
  findPaginatedFilteredCertificationCenters,
} from './handlers/certification-centers';
import { attachCombinedCourseBlueprintToOrganizations } from './handlers/combined-course-blueprint.js';
import { findPaginatedAndFilteredSessions } from './handlers/find-paginated-and-filtered-sessions';
import { findFrameworkAreas } from './handlers/frameworks';
import { getPaginatedJuryCertificationSummariesBySessionId } from './handlers/get-jury-certification-summaries-by-session-id';
import { getToBePublishedSessions } from './handlers/get-to-be-published-sessions';
import { getWithRequiredActionSessions } from './handlers/get-with-required-action-sessions';
import { createNetwork, findAllFilteredNetworks, updateNetwork } from './handlers/networks';
import { createOrganizationMembership } from './handlers/organization-memberships';
import {
  archiveOrganization,
  attachCertificationCenterToOrganization,
  findOrganizationCampaigns,
  findPaginatedFilteredOrganizations,
  findPaginatedOrganizationMemberships,
  getOrganizationAttachedCertificationCenters,
  getOrganizationInvitations,
  getOrganizationPlaces,
  getOrganizationPlacesStatistics,
  getOrganizationStatistics,
} from './handlers/organizations';
import { createStage } from './handlers/stages';
import {
  attachOrganizationsFromExistingTargetProfile,
  attachTargetProfiles,
  attachTargetProfileToOrganizations,
  copyTargetProfile,
  createBadge,
  createTargetProfile,
  findOrganizationTargetProfileSummaries,
  findPaginatedFilteredTargetProfileSummaries,
  findPaginatedTargetProfileOrganizations,
  findTargetProfileBadges,
  markTargetProfileAsSimplifiedAccess,
  outdate,
  updateTargetProfile,
  updateTargetProfileStageCollection,
} from './handlers/target-profiles';
import {
  attachTargetProfilesToTraining,
  createOrUpdateTrainingTrigger,
  createTraining,
  detachTargetProfileFromTraining,
  duplicateTraining,
  findPaginatedTrainingSummaries,
  getTargetProfileSummariesForTraining,
  getTraining,
  updateTraining,
} from './handlers/trainings';
import { updateEduV3ExternalJuryResult } from './handlers/update-edu-v3-external-jury-result';
import { findPaginatedFilteredUsers } from './handlers/users';

/* eslint-disable ember/no-get */
export default function routes() {
  this.namespace = 'api';

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.get('/admin/autonomous-courses/target-profiles', findAutonomousCourseTargetProfiles);
  this.post('/admin/autonomous-courses', createAutonomousCourse);
  this.get('/admin/autonomous-courses', getPaginatedAutonomousCourses);
  this.get('/admin/autonomous-courses/:id', getAutonomousCourseDetails);
  this.patch('/admin/autonomous-courses/:id', updateAutonomousCourse);

  this.patch('/admin/badge-criteria/:id', updateBadgeCriterion);

  this.get('/admin/campaigns/:id');
  this.get('/admin/campaigns/:id/participations', findPaginatedFilteredCampaignParticipations);

  this.get('/admin/admin-members', (schema) => {
    return schema.adminMembers.all();
  });
  this.post('/admin/admin-members', createAdminMember);
  this.get('/admin/admin-members/me', (schema, request) => {
    const userId = _parseUserIdFromJWT(request);
    return schema.adminMembers.findBy({ userId });
  });
  this.patch('/admin/admin-members/:id', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const role = requestBody.data.attributes.role;
    const id = request.params.id;
    const adminMember = schema.adminMembers.findBy({ id });
    return adminMember.update({ role });
  });

  this.put('/admin/admin-members/:id/deactivate', (schema, request) => {
    const adminMemberId = request.params.id;
    const adminMember = schema.adminMembers.find(adminMemberId);
    adminMember.destroy();
  });

  this.get('/admin/certification-versions/:id', (schema, request) => {
    return schema.certificationVersions.find(request.params.id);
  });
  this.patch('/admin/certification-versions/:id', (schema, request) => {
    const certificationVersionId = request.params.id;
    const certificationVersion = schema.certificationVersions.find(certificationVersionId);
    const params = JSON.parse(request.requestBody);
    return certificationVersion.update(params.data.attributes);
  });

  this.delete('/admin/certification-versions/:id', (schema, request) => {
    const certificationVersions = schema.certificationVersions.all();
    const certificationVersionToDelete = certificationVersions.filter((version) => version.id === request.params.id);
    certificationVersionToDelete.destroy();

    const frameworkHistory = schema.frameworkHistories.first();

    frameworkHistory.update({
      history: frameworkHistory.attrs.history.filter((version) => version.id !== Number(request.params.id)),
    });
  });

  this.get('/admin/certification-frameworks', (schema) => {
    return schema.certificationFrameworks.all();
  });

  this.get('/admin/sessions', findPaginatedAndFilteredSessions);
  this.get('/admin/sessions/to-publish', getToBePublishedSessions);
  this.get('/admin/sessions/with-required-action', getWithRequiredActionSessions);
  this.patch('/admin/sessions/:id/publish', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ publishedAt: new Date() });
    return new Response(204);
  });
  this.patch('/admin/sessions/:id/unpublish', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ publishedAt: null });
    return new Response(204);
  });
  this.get('/admin/sessions/:id');
  this.get('/admin/sessions/:id/certification-candidates', function (schema, request) {
    const sessionId = request.params.id;

    return schema.certificationCandidates.where({ sessionId });
  });
  this.get('/admin/sessions/:id/jury-certification-summaries', getPaginatedJuryCertificationSummariesBySessionId);
  this.post('/admin/sessions/publish-in-batch', () => {
    return new Response(200);
  });
  this.patch('/admin/sessions/:id/unfinalize', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ finalizedAt: null, assignedCertificationOfficerId: null });
    return new Response(204);
  });
  this.get('/admin/sessions/:id/generate-results-download-link', {
    sessionResultsLink: 'http://link-to-results.fr?lang=fr',
  });
  this.patch('/admin/sessions/:id/certification-officer-assignment', (schema, request) => {
    const userId = _parseUserIdFromJWT(request);
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    return session.update({ assignedCertificationOfficerId: userId });
  });

  this.post('/admin/simulate-score-or-capacity', (_schema, _request) => {
    return {
      data: {
        attributes: {
          capacity: 1,
          score: 768,
          competences: [{ competenceCode: '1.1', level: '3' }],
        },
      },
    };
  });

  this.get('/admin/organization-learners', findPaginatedFilteredLearners);

  this.get('/admin/users', findPaginatedFilteredUsers);
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

  this.post('/admin/certification-centers/:id/archive', (schema, request) => {
    const certificationCenterId = request.params.id;
    const certificationCenter = schema.certificationCenters.findBy({ id: certificationCenterId });
    return certificationCenter.update({ archivedAt: new Date('2025-01-01'), archivistFullName: 'John Doe' });
  });

  this.post('/admin/users/:id/anonymize', (schema, request) => {
    const userId = request.params.id;
    const user = schema.users.findBy({ id: userId });
    return user.update({
      firstName: '(anonymised)',
      lastName: '(anonymised)',
      email: null,
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
        422,
        {},
        {
          errors: [{ code: 'INVALID_OR_ALREADY_USED_EMAIL' }],
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

  this.get('/admin/certification-centers', findPaginatedFilteredCertificationCenters);
  this.get('/admin/certification-centers/:id');
  this.patch('/admin/certification-centers/:id');
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
    const certificationCenterId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;
    const lang = params.data.attributes.lang;
    const updatedAt = Date.now();
    return schema.certificationCenterInvitations.create({ email, lang, updatedAt, certificationCenterId });
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
  this.get('/admin/certification-centers/:id/organizations', findCertificationCenterAttachedOrganizations);

  this.get('/admin/users/:id/certification-courses', (schema, request) => {
    const userId = request.params.id;
    const user = schema.users.find(userId);
    return user.certificationCourses;
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

  this.get('/admin/networks', findAllFilteredNetworks);
  this.get('/admin/networks/:id');
  this.post('/admin/networks', createNetwork);
  this.patch('/admin/networks/:id', updateNetwork);

  this.get('/admin/organizations', findPaginatedFilteredOrganizations);
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
      features: {
        PLACES_MANAGEMENT: { active: false },
      },
    };

    return schema.create('organization', organization);
  });
  this.post('/admin/organizations/import-csv', async () => new Response(204));
  this.get('/admin/organizations/:id');
  this.get('/admin/organizations/:id/campaigns', findOrganizationCampaigns);
  this.get('/admin/organizations/:id/memberships', findPaginatedOrganizationMemberships);
  this.get('/admin/organizations/:id/target-profile-summaries', findOrganizationTargetProfileSummaries);
  this.post('/admin/organizations/:id/attach-target-profiles', attachTargetProfiles);
  this.get('/admin/organizations/:id/invitations', getOrganizationInvitations);
  this.get('/admin/organizations/:id/places', getOrganizationPlaces);
  this.get('/admin/organizations/:id/places-statistics', getOrganizationPlacesStatistics);
  this.get('/admin/organizations/:id/certification-centers', getOrganizationAttachedCertificationCenters);
  this.get('/admin/organizations/:id/statistics', getOrganizationStatistics);
  this.post('/admin/organizations/:id/archive', archiveOrganization);
  this.post('/admin/organizations/:id/detach-certification-center', () => new Response(204));
  this.post('/admin/organizations/:id/attach-certification-centers', attachCertificationCenterToOrganization);

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
  this.post('/admin/target-profiles/:id/copy', copyTargetProfile);

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
  this.delete('/admin/trainings/:trainingId/target-profiles/:targetProfileId', detachTargetProfileFromTraining);
  this.put('/admin/trainings/:id/triggers', createOrUpdateTrainingTrigger);
  this.post('/admin/trainings/:id/duplicate', duplicateTraining);

  this.get('/admin/certifications/:id');
  this.post('/admin/certifications/:id/rescore', () => {
    return new Response(201);
  });

  this.get('/admin/certifications/:id/certified-profile', (schema, request) => {
    const id = request.params.id;
    return schema.certifiedProfiles.find(id);
  });
  this.get('/admin/certifications/:id/details', (schema, request) => {
    const id = request.params.id;
    return schema.certificationDetails.find(id);
  });
  this.post('/admin/complementary-certification-course-results', (schema) => {
    const complementaryCertificationCourseResultWithExternal =
      schema.complementaryCertificationCourseResultWithExternals.first();

    complementaryCertificationCourseResultWithExternal.update({
      externalResult: 'Pix+ Édu Initiale 1er degré Confirmé',
      finalResult: 'Pix+ Édu Initiale 1er degré Initié (entrée dans le métier)',
    });
    return schema.certifications.first();
  });
  this.get('/admin/certification-courses-v3/:certificationCourseId/details', (schema, request) => {
    const certificationCourseId = request.params.certificationCourseId;
    return schema.v3CertificationCourseDetailsForAdministrations.find(certificationCourseId);
  });
  this.post('/admin/certification/neutralize-challenge', () => {
    return new Response(204);
  });
  this.post('/admin/certification/deneutralize-challenge', () => {
    return new Response(204);
  });
  this.get('/admin/certification-candidates/:id/timeline', (schema, request) => {
    return schema.certificationCandidateTimelines.find(request.params.id);
  });

  this.post('/admin/organizations/:id/invitations', (schema, request) => {
    const organizationId = request.params.id;
    const params = JSON.parse(request.requestBody);
    const email = params.data.attributes.email;
    const lang = params.data.attributes.lang;
    const role = params.data.attributes.role;
    const updatedAt = Date.now();
    return schema.organizationInvitations.create({ email, lang, role, updatedAt, organizationId });
  });
  this.delete('/admin/organizations/:id/invitations/:invitation-id', (schema, request) => {
    const organizationInvitationId = request.params['invitation-id'];

    const invitation = schema.organizationInvitations.find(organizationInvitationId);
    invitation.status = 'cancelled';

    return invitation;
  });
  this.patch('/admin/organizations/:id');

  this.delete('/admin/campaigns/:campaignId/campaign-participations/:campaignParticipationId', (schema, request) => {
    const campaignParticipationId = request.params.campaignParticipationId;
    const campaignId = request.params.campaignId;
    const participation = schema.userParticipations.findBy({ campaignParticipationId, campaignId });
    participation.update({
      deletedAt: new Date('2012-12-12'),
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

  this.patch('/admin/certification-courses/:id', (schema, request) => {
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

  this.get('admin/complementary-certifications/:key/target-profiles', (schema, request) => {
    return schema.complementaryCertifications.findBy({ key: request.params.key });
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

  this.get('admin/certification-frameworks/:scope/target-profiles', (schema, request) => {
    const framework = schema.certificationFrameworks.findBy({ name: request.params.scope });
    return {
      data: {
        id: request.params.scope,
        type: 'certification-frameworks',
        attributes: {
          name: request.params.scope,
          'target-profiles-history': framework?.targetProfilesHistory ?? [],
        },
      },
    };
  });

  this.get('admin/certification-frameworks/:scope/framework-history', (schema) => {
    return schema.frameworkHistories.first();
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

  this.patch('/admin/certification-courses/:id/cancel', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ status: assessmentResultStatus.CANCELLED });

    return new Response(204);
  });

  this.patch('/admin/certification-courses/:id/uncancel', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ status: assessmentResultStatus.REJECTED });

    return new Response(204);
  });

  this.patch('/admin/certification-courses/:id/reject', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ status: 'rejected', isRejectedForFraud: true });

    return new Response(204);
  });

  this.patch('/admin/certification-courses/:id/unreject', (schema, request) => {
    const certificationId = request.params.id;
    const certificationToUpdate = schema.certifications.find(certificationId);
    certificationToUpdate.update({ status: 'validated', isRejectedForFraud: false });

    return new Response(204);
  });

  this.post('/admin/certification-courses/:id/assessment-results', () => {
    return new Response(204);
  });

  this.post('/admin/certification-courses/:id/edu-v3-external-jury-result', updateEduV3ExternalJuryResult);

  this.get('/admin/tags');
  this.post('/admin/tags', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    const tagName = params.data.attributes.name;
    return schema.create('tag', { name: tagName });
  });

  this.post('/admin/campaigns', async () => new Response(204));
  this.get('/admin/administration-teams', async () => {
    return {
      data: [
        {
          type: 'administration-team',
          id: '2',
          attributes: {
            name: 'Équipe 2',
          },
        },
        {
          type: 'administration-team',
          id: '1',
          attributes: {
            name: 'Équipe 1',
          },
        },
      ],
    };
  });

  this.get('/admin/organization-learner-types', async () => {
    return {
      data: [
        {
          type: 'organization-learner-type',
          id: '2',
          attributes: {
            name: 'Student',
          },
        },
        {
          type: 'organization-learner-type',
          id: '1',
          attributes: {
            name: 'Teacher',
          },
        },
      ],
    };
  });

  this.get('/admin/oidc/identity-providers', () => {
    return {
      data: [
        {
          type: 'oidc-identity-providers',
          id: 'OIDC_PARTNER',
          attributes: {
            code: 'OIDC_PARTNER',
            application: 'app',
            'application-tld': '.fr',
            'organization-name': 'Partenaire OIDC',
            slug: 'oidc-partner',
            'should-close-session': false,
            source: 'oidc-externe',
          },
        },
      ],
    };
  });

  this.get('/oidc/identity-providers', () => {
    return {
      data: [
        {
          type: 'oidc-identity-providers',
          id: 'OIDC_PARTNER',
          attributes: {
            code: 'OIDC_PARTNER',
            application: 'app',
            'application-tld': '.fr',
            'organization-name': 'Partenaire OIDC',
            slug: 'oidc-partner',
            'should-close-session': false,
            source: 'oidc-externe',
          },
        },
      ],
    };
  });
  this.get('/admin/organization-learner-import-formats');
  this.get('/admin/combined-course-blueprints');
  this.post('/admin/combined-course-blueprints');
  this.post(
    '/admin/combined-course-blueprints/:combinedCourseBlueprintId/organizations',
    attachCombinedCourseBlueprintToOrganizations,
  );
  this.patch('/admin/combined-course-blueprints/:id');

  this.get('/admin/modules-metadata', () => {
    return {
      data: [
        {
          type: 'module-metadatas',
          id: '6282925d',
          attributes: {
            'short-id': '6a68bf32',
            slug: 'bac-a-sable',
            title: 'Bac à sable',
            'is-beta': true,
            duration: 5,
            image: 'https://assets.pix.org/modules/placeholder-details.svg',
            link: '/modules/6a68bf32/bac-a-sable',
          },
        },
      ],
    };
  });

  this.get('/admin/combined-course-blueprints/:id');
  this.get('/admin/attestations');
  _configureOrganizationsRoutes(this);
}

function _configureOrganizationsRoutes(context) {
  context.get('/admin/organizations/:organizationId/children', (schema, request) => {
    return schema.organizations.where({ parentOrganizationId: request.params.organizationId });
  });

  context.post('/admin/organizations/:organizationId/attach-child-organization', (schema, request) => {
    const parentOrganization = schema.organizations.find(request.params.organizationId);
    const { childOrganizationIds } = JSON.parse(request.requestBody);
    const childOrganization = schema.organizations.find(childOrganizationIds[0]);

    childOrganization.update({
      parentOrganizationId: parentOrganization.id,
      parentOrganizationName: parentOrganization.name,
    });

    return new Response(204);
  });

  context.post('admin/organizations/:childOrganizationId/detach-parent-organization', (schema, request) => {
    const childOrganization = schema.organizations.find(request.params.childOrganizationId);

    childOrganization.update({
      parentOrganizationId: null,
    });

    return new Response(204);
  });
}
/* eslint-enable ember/no-get */

function _parseUserIdFromJWT(request) {
  const userToken = request.requestHeaders.Authorization.replace('Bearer ', '');
  return JSON.parse(atob(userToken.split('.')[1])).user_id;
}
