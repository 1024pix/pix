const { databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Controller | sup-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/schooling-registration-user-associations/student', function () {
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations/student',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Jean',
        lastName: 'Michel',
        birthdate: new Date('2010-01-01'),
        studentNumber: '12345',
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();
    });

    it('should return an 204 status after updating higher organization learner', async function () {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'student-number': '12345',
          'first-name': 'Jean',
          'last-name': 'Michel',
          birthdate: '2010-01-01',
          'campaign-code': campaign.code,
        },
        type: 'schooling-registration-user-associations',
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/sup-organization-learners/association', function () {
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sup-organization-learners/association',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Jean',
        lastName: 'Michel',
        birthdate: new Date('2010-01-01'),
        studentNumber: '12345',
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();
    });

    it('should return an 204 status after updating higher organization learner', async function () {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'student-number': '12345',
          'first-name': 'Jean',
          'last-name': 'Michel',
          birthdate: '2010-01-01',
          'campaign-code': campaign.code,
        },
        type: 'sup-organization-learners',
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
