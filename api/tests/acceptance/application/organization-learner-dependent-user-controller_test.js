const { databaseBuilder, expect, knex } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Route | organization-learner-dependent-user', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('authentication-methods').delete();
  });

  describe('POST /api/schooling-registration-dependent-users/recover-account', function () {
    it('should return a 200 status and student information for account recovery', async function () {
      // given
      const studentInformation = {
        ineIna: '123456789AA',
        firstName: 'Jude',
        lastName: 'Law',
        birthdate: '2016-06-01',
      };
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        firstName: 'Judy',
        lastName: 'Howl',
        email: 'jude.law@example.net',
        username: 'jude.law0601',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        id: 7,
        name: 'Collège Hollywoodien',
      });
      const latestOrganization = databaseBuilder.factory.buildOrganization({
        id: 2,
        name: 'Super Collège Hollywoodien',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: organization.id,
        updatedAt: new Date('2005-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        ...studentInformation,
        nationalStudentId: studentInformation.ineIna,
        organizationId: latestOrganization.id,
        updatedAt: new Date('2010-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/recover-account',
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data).to.deep.equal({
        type: 'student-information-for-account-recoveries',
        attributes: {
          'first-name': 'Jude',
          'last-name': 'Law',
          username: 'jude.law0601',
          email: 'jude.law@example.net',
          'latest-organization-name': 'Super Collège Hollywoodien',
        },
      });
    });
  });
});
