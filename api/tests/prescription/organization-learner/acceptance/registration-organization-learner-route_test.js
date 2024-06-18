import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | Application | registration-organization-learner-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organization-learners', function () {
    let options;
    let user;
    let organization;
    let organizationLearner;
    let campaignCode;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, code: 'YUTR789' }).code;
      user = databaseBuilder.factory.buildUser();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'josé',
        lastName: 'bové',
        birthdate: '2020-01-01',
        nationalStudentId: 'josébové123',
        organizationId: organization.id,
        userId: user.id,
      });
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/organization-learners?userId=${user.id}&campaignCode=${campaignCode}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    describe('Success case', function () {
      it('should return the organizationLearner linked to the user and a 200 status code response', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('organization-learner-identities');
        expect(response.result.data.attributes['first-name']).to.deep.equal(organizationLearner.firstName);
        expect(response.result.data.attributes['last-name']).to.deep.equal(organizationLearner.lastName);
      });
    });
  });
});
