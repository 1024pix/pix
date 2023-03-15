import Response from 'ember-cli-mirage/response';
import { findPaginatedCampaignProfilesCollectionParticipationSummaries } from './handlers/find-paginated-campaign-participation-summaries';
import { findPaginatedOrganizationMemberships } from './handlers/find-paginated-organization-memberships';
import { findFilteredPaginatedScoOrganizationParticipants } from './handlers/find-filtered-paginated-sco-organization-participants';
import { findFilteredPaginatedSupOrganizationParticipants } from './handlers/find-filtered-paginated-sup-organization-participants';
import { findPaginatedAssessmentResults } from './handlers/find-paginated-assessment-results';
import { findFilteredPaginatedOrganizationParticipants } from './handlers/find-filtered-paginated-organization-participants';

const emptyData = {
  data: {
    attributes: {},
  },
};

function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

/* eslint ember/no-get: off */
export default function () {
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0;

  this.post('/token', (schema, request) => {
    const params = parseQueryString(request.requestBody);
    const foundUser = schema.users.findBy({ email: params.username });

    if (foundUser && (params.password === 'secret' || params.password === 'Password4register')) {
      return {
        token_type: '',
        expires_in: '',
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

  this.post('/revoke', () => {});

  this.get('/prescription/prescribers/:id', (schema, request) => {
    const prescriber = schema.prescribers.find(request.params.id);
    return prescriber;
  });

  this.post('/users', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const user = schema.users.create({ ...body.data.attributes });

    schema.prescribers.create({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return user;
  });

  this.patch('/users/:id/pix-orga-terms-of-service-acceptance', (schema, request) => {
    const user = schema.users.find(request.params.id);
    user.update({ pixOrgaTermsOfServiceAccepted: true });
    return user;
  });

  this.patch('/memberships/:id');

  this.get('/organizations/:id/campaigns', (schema, request) => {
    const {
      'filter[ownerName]': ownerName,
      'filter[name]': campaignName,
      'filter[isOwnedByMe]': isOwnedByMe,
    } = request.queryParams;
    let results;

    if (!ownerName && !campaignName && !isOwnedByMe) {
      results = schema.campaigns.all();
    } else if (ownerName && !campaignName) {
      results = schema.campaigns.where(
        ({ ownerFirstName, ownerLastName }) => ownerFirstName.includes(ownerName) || ownerLastName.includes(ownerName)
      );
    } else if (!ownerName && campaignName) {
      results = schema.campaigns.where(({ name }) => name.includes(campaignName));
    } else if (isOwnedByMe && !campaignName) {
      // choix arbitraire car on ne peux pas aller chercher l'userId dans la requête
      // voir createUserWithMembershipAndTermsOfServiceAccepted()
      results = schema.campaigns.where({ ownerId: 7 });
    } else if (isOwnedByMe && campaignName) {
      results = schema.campaigns.where(({ name, ownerId }) => name.includes(campaignName) && ownerId === 7);
    } else {
      results = schema.campaigns.where(
        ({ ownerFirstName, ownerLastName, name }) =>
          (ownerFirstName.includes(ownerName) || ownerLastName.includes(ownerName)) && name.includes(campaignName)
      );
    }
    const json = this.serializerOrRegistry.serialize(results, request);
    json.meta = { hasCampaigns: results.length > 0 };

    return json;
  });

  this.get('/organizations/:id/groups', (schema) => {
    return schema.groups.all();
  });

  this.get('/organizations/:id/memberships', findPaginatedOrganizationMemberships);

  this.get('/organizations/:id/member-identities', (schema) => {
    return schema.memberIdentities.all();
  });

  this.get('/organizations/:id/invitations', (schema) => {
    return schema.organizationInvitations.all();
  });

  this.post('/organizations/:id/invitations', (schema, request) => {
    const organizationId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const email = requestBody.data.attributes.email;
    const code = 'ABCDEFGH01';

    schema.organizationInvitations.create({
      organizationId,
      email: email,
      status: 'PENDING',
      code,
      createdAt: new Date(),
    });

    return schema.organizationInvitations.where({ email });
  });

  this.get('/organization-invitations/:id', (schema, request) => {
    const organizationInvitationId = request.params.id;
    const organizationInvitationCode = request.queryParams.code;
    if (!organizationInvitationCode) {
      return new Response(400, {}, { errors: [{ status: '400', detail: '' }] });
    }
    const organizationInvitation = schema.organizationInvitations.findBy({
      id: organizationInvitationId,
      code: organizationInvitationCode,
    });
    if (!organizationInvitation) {
      return new Response(404, {}, { errors: [{ status: '404', detail: '' }] });
    }
    if (organizationInvitation.status === 'accepted') {
      return new Response(412, {}, { errors: [{ status: '412', detail: '' }] });
    }
    if (organizationInvitation.status === 'cancelled') {
      return new Response(403, {}, { errors: [{ status: '403', detail: '' }] });
    }

    return organizationInvitation;
  });

  this.post('/organization-invitations/:id/response', (schema, request) => {
    const organizationInvitationId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const { code } = requestBody.data.attributes;

    const organizationInvitation = schema.organizationInvitations.findBy({ id: organizationInvitationId, code });
    const prescriber = schema.prescribers.first();

    const membership = schema.memberships.create({
      userId: prescriber.id,
      organizationId: organizationInvitation.organizationId,
      organizationRole: 'MEMBER',
    });

    prescriber.memberships = [membership];
    prescriber.save();

    const organization = schema.organizations.find(organizationInvitation.organizationId);
    schema.userOrgaSettings.create({ user: prescriber, organization });

    organizationInvitation.update({ status: 'accepted' });
    schema.organizationInvitationResponses.create();

    return new Response(204);
  });

  this.post('/organization-invitations/sco', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const { uai, firstName, lastName } = requestBody.data.attributes;

    const organization = schema.organizations.findBy({ externalId: uai });

    if (!organization || organization.type !== 'SCO') {
      return new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
              title: 'OrganizationNotFoundError',
              detail:
                "L'UAI/RNE de l'établissement ne correspond à aucun établissement dans la base de données Pix. Merci de contacter le support.",
            },
          ],
        }
      );
    }

    if (!organization.email) {
      return new Response(
        412,
        {},
        {
          errors: [
            {
              status: '412',
              title: 'OrganizationWithoutEmailError',
              detail:
                "Nous n'avons pas d'adresse e-mail de contact associé à votre établissement, merci de contacter le support pour récupérer votre accès.",
            },
          ],
        }
      );
    }

    return schema.scoOrganizationInvitations.create({ uai, firstName, lastName });
  });

  this.delete('/organizations/:id/invitations/:invitation-id', (schema, request) => {
    const organizationInvitationId = request.params['invitation-id'];

    const invitation = schema.organizationInvitations.find(organizationInvitationId);
    invitation.status = 'cancelled';

    return invitation;
  });

  this.get('/organizations/:id/sco-participants', findFilteredPaginatedScoOrganizationParticipants);

  this.get('/organizations/:id/sup-participants', findFilteredPaginatedSupOrganizationParticipants);

  this.get('/organizations/:id/participants', findFilteredPaginatedOrganizationParticipants);

  this.get('/organization-learners/:id', (schema, request) => {
    const participantId = request.params.id;

    return { data: { id: participantId, type: 'organization-learner' } };
  });

  this.get('/organization-learners/:id/activity', (schema, request) => {
    const participantId = request.params.id;

    return { data: { id: `${participantId}-activity`, type: 'organization-learner-activity' } };
  });

  this.post('/organizations/:id/sco-organization-learners/import-siecle', (schema, request) => {
    const type = request.requestBody.type;

    if (type === 'invalid-file') {
      return new Promise((resolve) => {
        resolve(
          new Response(
            422,
            {},
            { errors: [{ status: '422', detail: '422 - Le détail affiché est envoyé par le back' }] }
          )
        );
      });
    } else if (type === 'valid-file') {
      const organizationId = request.params.id;
      return schema.scoOrganizationParticipants.create({ organizationId, firstName: 'Harry', lastName: 'Cover' });
    }
  });

  this.post('/organizations/:id/sup-organization-learners/import-csv', async (schema, request) => {
    const type = request.requestBody.type;

    if (type === 'valid-file') {
      const organizationId = request.params.id;
      return schema.supOrganizationParticipants.create({ organizationId, firstName: 'Harry', lastName: 'Cover' });
    } else if (type === 'valid-file-with-warnings') {
      const organizationId = request.params.id;
      await schema.supOrganizationParticipants.create({ organizationId, firstName: 'Harry', lastName: 'Cover' });
      return Promise.resolve(
        new Response(
          200,
          {},
          { data: { attributes: { warnings: [{ field: 'diploma', value: 'BAD', code: 'unknown' }] } } }
        )
      );
    } else if (type === 'invalid-file') {
      return new Promise((resolve) => {
        resolve(new Response(412, {}, { errors: [{ status: '412', detail: 'Erreur d’import' }] }));
      });
    }
  });

  this.patch('/organizations/:id/sup-organization-learners/:studentId', (schema, request) => {
    const { studentId } = request.params;
    const {
      data: {
        attributes: { ['student-number']: studentNumber },
      },
    } = JSON.parse(request.requestBody);

    if (schema.supOrganizationParticipants.all().models.find((student) => student.studentNumber === studentNumber)) {
      return new Response(412, {}, { errors: [{ status: '412', detail: 'STUDENT_NUMBER_EXISTS' }] });
    }
    const student = schema.supOrganizationParticipants.find(studentId);
    return student.update({ studentNumber });
  });

  this.get('/campaigns/:id');

  this.patch('/campaigns/:id');

  this.put('/campaigns/:id/archive', (schema, request) => {
    const id = request.params.id;
    const campaign = schema.campaigns.findBy({ id });
    return campaign.update({ isArchived: true });
  });

  this.get('/organizations/:id/target-profiles', (schema) => {
    return schema.targetProfiles.all();
  });

  this.post('/campaigns', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    const ownerId = body.data.attributes['owner-id'];
    const owner = schema.memberIdentities.findBy({ id: ownerId });

    const campaign = {
      ...body.data.attributes,
      customLandingPageText: body.data.attributes['custom-landing-page-text'],
      idPixLabel: body.data.attributes['id-pix-label'],
      ownerFirstName: owner.firstName,
      ownerLastName: owner.lastName,
    };
    if (campaign.type === 'PROFILES_COLLECTION') {
      return schema.campaigns.create(campaign);
    } else if (campaign.type === 'ASSESSMENT') {
      const targetProfileId = body.data.relationships['target-profile'].data.id;
      return schema.campaigns.create({ ...campaign, targetProfileId });
    }
    return new Response(422);
  });

  this.get('/campaigns/:id/collective-results', (schema, request) => {
    const campaignId = request.params.id;
    const campaign = schema.campaigns.find(campaignId);
    return campaign.campaignCollectiveResult;
  });

  this.get('/campaigns/:id/analyses', (schema, request) => {
    const campaignId = request.params.id;
    const campaign = schema.campaigns.find(campaignId);
    return campaign.campaignAnalysis;
  });

  this.get(
    '/campaigns/:id/profiles-collection-participations',
    findPaginatedCampaignProfilesCollectionParticipationSummaries
  );

  this.get('/campaign-participations/:id/analyses', (schema, request) => {
    return schema.campaignAnalyses.findBy({ ...request.params });
  });

  this.post('/sco-organization-learners/password-update', (schema) => {
    return schema.dependentUsers.create({
      generatedPassword: 'Passw0rd',
    });
  });

  this.post('/sco-organization-learners/username-password-generation', (schema) => {
    return schema.dependentUsers.create({
      username: 'user.gar3112',
      generatedPassword: 'Passw0rd',
    });
  });

  this.post('/user-orga-settings', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const userId = requestBody.data.relationships.user.data.id;
    const organizationId = requestBody.data.relationships.organization.data.id;

    const user = schema.users.find(userId);
    const organization = schema.organizations.find(organizationId);

    return schema.userOrgaSettings.create({ user, organization });
  });

  this.put('/user-orga-settings/:id', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const userOrgaSettingsId = request.params.id;
    const organizationId = requestBody.data.relationships.organization.data.id;

    const userOrgaSettings = schema.userOrgaSettings.find(userOrgaSettingsId);
    const organization = schema.organizations.find(organizationId);

    return userOrgaSettings.update({ organization });
  });

  this.get('/campaigns/:campaignId/profiles-collection-participations/:campaignParticipationId', (schema, request) => {
    const campaignId = request.params.campaignId;
    const id = request.params.campaignParticipationId;
    return schema.campaignProfiles.findBy({ campaignId, id });
  });

  this.get('/campaigns/:campaignId/assessment-participations/:id', (schema, request) => {
    return schema.campaignAssessmentParticipations.findBy({ ...request.params });
  });

  this.get('/campaigns/:campaignId/assessment-participations/:id/results', (schema, request) => {
    return schema.campaignAssessmentParticipationResults.findBy({ ...request.params });
  });

  this.get('/campaigns/:campaignId/participants-activity', (schema) => {
    return schema.campaignParticipantActivities.all();
  });

  this.get('/campaigns/:campaignId/assessment-results', findPaginatedAssessmentResults);

  this.get('/campaigns/:campaignId/stats/participations-by-status', () => {
    return emptyData;
  });

  this.get('/campaigns/:campaignId/stats/participations-by-day', () => {
    return {
      data: {
        attributes: {
          'started-participations': [],
          'shared-participations': [],
        },
      },
    };
  });

  this.get('/campaigns/:campaignId/stats/participations-by-mastery-rate', () => {
    return {
      data: {
        attributes: {
          'result-distribution': [],
        },
      },
    };
  });

  this.get('feature-toggles', (schema) => {
    return schema.featureToggles.findOrCreateBy({ id: 0 });
  });

  this.get('/organizations/:id/divisions', (schema, _) => {
    return schema.divisions.all();
  });

  this.post('/memberships/:id/disable', (schema, request) => {
    const membershipId = request.params.id;

    const membership = schema.memberships.find(membershipId);
    membership.destroy();

    return new Response(204);
  });

  this.get('/frameworks/for-target-profile-submission', (schema) => {
    return schema.frameworks.all();
  });

  this.delete('/campaigns/:campaignId/campaign-participations/:campaignParticipationId', (schema, request) => {
    const campaignParticipationId = request.params.campaignParticipationId;

    const campaignParticipation = schema.campaignParticipantActivities.find(campaignParticipationId);
    campaignParticipation.destroy();

    return new Response(204);
  });
}
