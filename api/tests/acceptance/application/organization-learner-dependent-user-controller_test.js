const { databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Route | organization-learner-dependent-user', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('authentication-methods').delete();
  });

  describe('POST /api/schooling-registration-dependent-users/generate-username-password', function () {
    let organizationId;
    let organizationLearnerId;
    let options;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      }).id;
      const userId = databaseBuilder.factory.buildUser.withRawPassword({
        username: null,
      }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/generate-username-password',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'schooling-registration-id': organizationLearnerId,
            },
          },
        },
      };
    });

    it('should return a 200 status after having successfully generated username and temporary password', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 status when organizationLearner does not exist', async function () {
      // given
      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerId + 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it("should return a 404 status when organizationLearner's userId does not exist", async function () {
      // given
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId: null,
      }).id;
      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 403 status when student does not belong to the same organization as organizationLearner', async function () {
      // given
      options.payload.data.attributes['organization-id'] = organizationId + 1;
      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 403 status when user does not belong to the same organization as organizationLearner', async function () {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const organizationLearnerWithWrongOrganization = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: wrongOrganization.id,
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerWithWrongOrganization.id;
      options.payload.data.attributes['organization-id'] = wrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
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
