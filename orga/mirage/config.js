import Response from 'ember-cli-mirage/response';
import {
  findPaginatedCampaignAssessmentParticipationSummaries,
  findPaginatedCampaignProfilesCollectionParticipationSummaries,
} from './handlers/find-paginated-campaign-participation-summaries';
import { findPaginatedOrganizationMemberships } from './handlers/find-paginated-organization-memberships';
import { findFilteredPaginatedStudents } from './handlers/find-filtered-paginated-students';

function parseQueryString(queryString) {
  const result = Object.create(null);
  queryString.split('&').forEach((pair) => {
    const [name, value] = pair.split('=');
    result[name] = decodeURIComponent(value);
  });
  return result;
}

/* eslint ember/no-get: off */
export default function() {

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
        access_token: 'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        user_id: foundUser.id,
      };
    } else {
      return new Response([{ 'status': '401', 'title': 'Unauthorized', 'detail': 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.' }],
      );
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

  this.get('/users/me', (schema, request) => {
    const userToken = request.requestHeaders['Authorization'].replace('Bearer ', '');
    const userId = JSON.parse(atob(userToken.split('.')[1])).user_id;

    return schema.users.find(userId);
  });

  this.patch('/users/:id/pix-orga-terms-of-service-acceptance', (schema, request) => {
    const user = schema.users.find(request.params.id);
    user.update({ pixOrgaTermsOfServiceAccepted: true });
    return user;
  });

  this.get('/users/:id/memberships', (schema, request) => {
    const userId = request.params.id;
    return schema.memberships.where({ userId });
  });

  this.patch('/memberships/:id');

  this.get('/organizations/:id/campaigns', (schema, request) => {
    const results = schema.campaigns.all();
    const json = this.serializerOrRegistry.serialize(results, request);
    json.meta = { hasCampaigns: results.length > 0 };

    return json;
  });

  this.get('/organizations/:id/memberships', findPaginatedOrganizationMemberships);

  this.get('/organizations/:id/invitations', (schema, request) => {
    const organizationId = request.params.id;
    return schema.organizationInvitations.where({ organizationId });
  });

  this.post('/organizations/:id/invitations', (schema, request) => {
    const organizationId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const email = requestBody.data.attributes.email;
    const code = 'ABCDEFGH01';

    schema.organizationInvitations.create({
      organizationId, email: email, status: 'PENDING', code,
      createdAt: new Date(),
    });

    return schema.organizationInvitations.where({ email });
  });

  this.get('/organization-invitations/:id', (schema, request) => {
    const organizationInvitationId = request.params.id;
    const organizationInvitationCode = request.queryParams.code;
    if (!organizationInvitationCode) {
      return new Response(400, {}, { errors: [ { status: '400', detail: '' } ] });
    }

    const organizationInvitation = schema.organizationInvitations.findBy({ id: organizationInvitationId, code: organizationInvitationCode });
    if (!organizationInvitation) {
      return new Response(404, {}, { errors: [ { status: '404', detail: '' } ] });
    }
    if (organizationInvitation.status === 'accepted') {
      return new Response(412, {}, { errors: [ { status: '412', detail: '' } ] });
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

    organizationInvitation.update({ status: 'accepted' });
    schema.organizationInvitationResponses.create();

    return new Response(204);
  });

  this.post('/organization-invitations/sco', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const { uai, firstName, lastName } = requestBody.data.attributes;

    const organization = schema.organizations.findBy({ externalId: uai });

    if (!organization || organization.type !== 'SCO') {
      return new Response(404, {}, { errors: [ { status: '404', title: 'OrganizationNotFoundError', detail: 'L\'UAI/RNE de l\'établissement ne correspond à aucun établissement dans la base de données Pix. Merci de contacter le support.' } ] });
    }

    if (!organization.email) {
      return new Response(412, {}, { errors: [ { status: '412', title: 'OrganizationWithoutEmailError', detail: 'Nous n\'avons pas d\'adresse e-mail de contact associé à votre établissement, merci de contacter le support pour récupérer votre accès.' } ] });
    }

    return schema.scoOrganizationInvitations.create({ uai, firstName, lastName });
  });

  this.get('/organizations/:id/students', findFilteredPaginatedStudents);

  this.post('/organizations/:id/schooling-registrations/import-siecle', (schema, request) => {
    const type = request.requestBody.type;

    if (type === 'invalid-file') {
      return new Promise((resolve) => {
        resolve(new Response(422, {}, { errors: [ { status: '422', detail: '422 - Le détail affiché est envoyé par le back' } ] }));
      });
    } else if (type === 'file-with-students-info-problems') {
      return new Promise((resolve) => {
        resolve(new Response(409, {}, { errors: [ { status: '409', detail: '409 - Le détail affiché est envoyé par le back' } ] }));
      });
    } else if (type === 'file-with-csv-problems') {
      return new Promise((resolve) => {
        resolve(new Response(412, {}, { errors: [ { status: '412', detail: '412 - Le détail affiché est envoyé par le back' } ] }));
      });
    } else if (type === 'file-with-problems') {
      return new Promise((resolve) => {
        resolve(new Response(400, {}, { errors: [ { status: '400', detail: '400 - détail.' } ] }));
      });
    } else if (type === 'valid-file') {
      const organizationId = request.params.id;
      return schema.students.create({ organizationId: organizationId, firstName: 'Harry', lastName: 'Cover' });
    } else {
      return new Promise((resolve) => {
        resolve(new Response(500, {}, { errors: [ { status: '500', detail: 'error 500' } ] }));
      });
    }
  });

  this.post('/organizations/:id/schooling-registrations/import-csv', (schema, request) => {
    const type = request.requestBody.type;

    if (type === 'valid-file') {
      const organizationId = request.params.id;
      return schema.students.create({ organizationId: organizationId, firstName: 'Harry', lastName: 'Cover' });
    } else if (type === 'invalid-file') {
      return new Promise((resolve) => {
        resolve(new Response(412, {}, { errors: [ { status: '412', detail: 'Erreur d’import' } ] }));
      });
    }
  });

  this.patch('/organizations/:id/schooling-registration-user-associations/:studentId', (schema, request) => {
    const { studentId } = request.params;
    const { data: { attributes: { ['student-number']: studentNumber } } } = JSON.parse(request.requestBody);

    if (schema.students.all().models.find((student) => student.studentNumber === studentNumber)) {
      return new Response(412);
    }
    const student = schema.students.find(studentId);
    return student.update({ studentNumber });
  });

  this.get('/campaigns/:id');

  this.patch('/campaigns/:id');

  this.get('/organizations/:id/target-profiles', (schema) => {
    return schema.targetProfiles.all();
  });

  this.post('/campaigns', (schema, request) => {
    const body = JSON.parse(request.requestBody);
    const campaign = {
      ...body.data.attributes,
      customLandingPageText: body.data.attributes['custom-landing-page-text'],
      idPixLabel: body.data.attributes['id-pix-label'],
    };
    if (campaign.type === 'PROFILES_COLLECTION') {
      return schema.campaigns.create(campaign);
    } else if (campaign.type === 'ASSESSMENT') {
      const targetProfileId = body.data.relationships['target-profile'].data.id;
      return schema.campaigns.create({ ...campaign, targetProfileId });
    }
    return new Response(422);
  });

  this.get('/campaigns/:id/campaign-report', (schema, request) => {
    const campaignId = request.params.id;
    const campaign = schema.campaigns.find(campaignId);
    const foundCampaignReport = campaign.campaignReport;
    const emptyCampaignReport = schema.campaignReports.create({ participationsCount: 0, sharedParticipationsCount: 0 });
    return foundCampaignReport ? foundCampaignReport : emptyCampaignReport;
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

  this.get('/campaigns/:campaignId/assessment-participations', findPaginatedCampaignAssessmentParticipationSummaries);

  this.get('/campaigns/:id/profiles-collection-participations', findPaginatedCampaignProfilesCollectionParticipationSummaries);

  this.get('/campaign-participations/:id');

  this.get('/campaign-participations/:id/analyses', (schema, request) => {
    return schema.campaignAnalyses.findBy({ ...request.params });
  });

  this.post('/schooling-registration-dependent-users/password-update', (schema) => {
    return schema.schoolingRegistrationDependentUsers.create({
      generatedPassword: 'Passw0rd',
    });
  });

  this.post('/schooling-registration-dependent-users/generate-username-password', (schema) => {
    return schema.schoolingRegistrationDependentUsers.create({
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
    return schema.campaignProfiles.findBy({ ...request.params });
  });

  this.get('/campaigns/:campaignId/assessment-participations/:id', (schema, request) => {
    return schema.campaignAssessmentParticipations.findBy({ ...request.params });
  });

  this.get('/campaigns/:campaignId/assessment-participations/:id/results', (schema, request) => {
    return schema.campaignAssessmentParticipationResults.findBy({ ...request.params });
  });

  this.delete('/schooling-registration-user-associations', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);

    const student = schema.students.find(requestBody.data.attributes['schooling-registration-id']);
    return student.update({ email: null });
  });

}
