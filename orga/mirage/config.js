import Response from 'ember-cli-mirage/response';

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

  this.post('/token', (schema, request) => {
    const params = parseQueryString(request.requestBody);
    const foundUser = schema.users.findBy({ email: params.username });

    if (foundUser && (params.password === 'secret' || params.password === 'Password4register')) {
      return {
        token_type: '',
        expires_in: '',
        access_token: 'aaa.' + btoa(`{"user_id":${foundUser.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        user_id: foundUser.id
      };
    } else {
      return new Response([{ 'status' : '401', 'title' : 'Unauthorized' , 'detail' : 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.' }]
      );
    }
  });

  this.post('/revoke', () => {});

  this.post('/users');

  this.get('/users/me', (schema, request) => {
    const userToken = request.requestHeaders.authorization.replace('Bearer ', '');
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

  this.patch('/memberships/:id', (schema, request) => {
    const id = request.params.id;
    return schema.memberships.find(id);
  });

  this.get('/organizations/:id/campaigns', (schema) => {
    return schema.campaigns.all();
  });

  this.get('/organizations/:id/memberships', (schema, request) => {
    const organizationId = request.params.id;
    return schema.memberships.where({ organizationId });
  });

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
      createdAt: new Date()
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
      return new Response(421, {}, { errors: [ { status: '421', detail: '' } ] });
    }

    return organizationInvitation;
  });

  this.post('/organization-invitations/:id/response', (schema, request) => {
    const organizationInvitationId = request.params.id;
    const requestBody = JSON.parse(request.requestBody);
    const { code, status, email } = requestBody.data.attributes;

    const organizationInvitation = schema.organizationInvitations.findBy({ id: organizationInvitationId, code });
    const user = schema.users.findBy({ email });

    schema.memberships.create({
      userId: user.id,
      organizationId: organizationInvitation.organizationId,
      organizationRole: 'MEMBER'
    });

    organizationInvitation.update({ status });
    schema.organizationInvitationResponses.create();

    return new Response(204);
  });

  this.get('/organizations/:id/students', (schema, request) => {
    const organizationId = request.params.id;
    return schema.students.where({ organizationId });
  });

  this.post('/organizations/:id/import-students', (schema, request) => {
    const type = request.requestBody.type;

    if (type === 'invalid-file') {
      return new Promise((resolve) => {
        resolve(new Response(422, {}, { errors: [ { status: '422', detail: '422 - Le détail affiché est envoyé par le back' } ] }));
      });
    } else if (type === 'file-with-students-info-problems') {
      return new Promise((resolve) => {
        resolve(new Response(409, {}, { errors: [ { status: '409', detail: '409 - Le détail affiché est envoyé par le back' } ] }));
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

  this.get('/campaigns/:id');

  this.patch('/campaigns/:id');

  this.get('/organizations/:id/target-profiles', (schema) => {
    return schema.targetProfiles.all();
  });

  this.post('/campaigns');

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

  this.get('/campaign-participations', (schema, request) => {
    const qp = request.queryParams;
    const campaignId = qp['filter[campaignId]'];
    const pageNumber = parseInt(qp['page[number]']);
    const pageSize = parseInt(qp['page[size]']);
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const campaignParticipations = schema.campaignParticipations.where({ campaignId }).models;
    const campaignParticipationIds = campaignParticipations.slice(start, end).map(
      (campaignParticipation) => campaignParticipation.attrs.id
    );
    const results = schema.campaignParticipations.find(campaignParticipationIds);
    const json = this.serializerOrRegistry.serialize(results, request);
    const rowCount = campaignParticipations.length;
    const pageCount = Math.ceil(rowCount / pageSize);
    json.meta = { page: pageNumber, pageSize, rowCount, pageCount };
    return json;
  });

  this.get('/campaign-participations/:id');

  this.get('/campaign-participation-results/:id');

  this.post('/student-dependent-users/password-update', (schema, request) => {
    const passwordForFailure = 'passwordFor01Failure';

    const requestBody = JSON.parse(request.requestBody);
    const { password } = requestBody.data.attributes;
    if (password === passwordForFailure) {
      return new Response(500, {}, { errors: [ { status: '500', detail: '' } ] });
    }

    const user = schema.users.find(1);
    user.modelName = 'student-dependent-users';
    return user;
  });

  this.post('/user-orga-settings', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const userId = requestBody.data.relationships.user.data.id;
    const organizationId = requestBody.data.relationships.organization.data.id;

    const user = schema.users.find(userId);
    const organization = schema.organizations.find(organizationId);

    return schema.userOrgaSettings.create({ user, organization });
  });

  this.patch('/user-orga-settings/:id', (schema, request) => {
    const requestBody = JSON.parse(request.requestBody);
    const userOrgaSettingsId = request.params.id;
    const organizationId = requestBody.data.relationships.organization.data.id;

    const userOrgaSettings = schema.userOrgaSettings.find(userOrgaSettingsId);
    const organization = schema.organizations.find(organizationId);
    return userOrgaSettings.update({ organization });
  });

}
