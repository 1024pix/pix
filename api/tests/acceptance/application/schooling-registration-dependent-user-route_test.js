const { databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Route | Schooling-registration-dependent-user', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('authentication-methods').delete();
  });

  describe('POST /api/schooling-registration-dependent-users', function () {
    let organization;
    let campaign;
    let organizationLearner;

    beforeEach(async function () {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId: 'salut',
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();
    });

    context('when creation is with email', function () {
      it('should return an 204 status after having successfully created user and associated user to schoolingRegistration', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/schooling-registration-dependent-users',
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': organizationLearner.firstName,
                'last-name': organizationLearner.lastName,
                birthdate: organizationLearner.birthdate,
                password: 'P@ssw0rd',
                email: 'angie@example.net',
                'with-username': false,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when no schoolingRegistration not linked yet found', function () {
        it('should respond with a 409 - Conflict', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const organizationLearnerAlreadyLinked = databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'josé',
            lastName: 'bové',
            birthdate: '2020-01-01',
            organizationId: organization.id,
            userId,
            nationalStudentId: 'coucou',
          });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/schooling-registration-dependent-users',
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearnerAlreadyLinked.firstName,
                  'last-name': organizationLearnerAlreadyLinked.lastName,
                  birthdate: organizationLearnerAlreadyLinked.birthdate,
                  password: 'P@ssw0rd',
                  email: 'angie@example.net',
                  'with-username': false,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal(
            'Un compte existe déjà pour l‘élève dans le même établissement.'
          );
        });
      });

      context('when a field is not valid', function () {
        it('should respond with a 422 - Unprocessable Entity', async function () {
          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/schooling-registration-dependent-users',
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearner.firstName,
                  'last-name': organizationLearner.lastName,
                  birthdate: organizationLearner.birthdate,
                  password: 'P@ssw0rd',
                  email: 'not valid email',
                  'with-username': false,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });

    context('when creation is with username', function () {
      it('should return a 204 status after having successfully created user and associated user to schoolingRegistration', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/schooling-registration-dependent-users',
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': organizationLearner.firstName,
                'last-name': organizationLearner.lastName,
                birthdate: organizationLearner.birthdate,
                password: 'P@ssw0rd',
                username: 'angie.go1234',
                'with-username': true,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when username is already taken', function () {
        it('should respond with a 422 - Unprocessable entity', async function () {
          // given
          const username = 'angie.go1234';
          databaseBuilder.factory.buildUser({ username });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/schooling-registration-dependent-users',
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': organizationLearner.firstName,
                  'last-name': organizationLearner.lastName,
                  birthdate: organizationLearner.birthdate,
                  password: 'P@ssw0rd',
                  username,
                  'with-username': true,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].detail).to.equal(
            'Cet identifiant n’est plus disponible, merci de recharger la page.'
          );
        });
      });
    });
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

    it('should return a 404 status when schoolingRegistration does not exist', async function () {
      // given
      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerId + 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it("should return a 404 status when schoolingRegistration's userId does not exist", async function () {
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

    it('should return a 403 status when student does not belong to the same organization as schoolingRegistration', async function () {
      // given
      options.payload.data.attributes['organization-id'] = organizationId + 1;
      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 403 status when user does not belong to the same organization as schoolingRegistration', async function () {
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

  describe('POST /api/schooling-registration-dependent-users/password-update', function () {
    let organizationId;
    let options;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/password-update',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'schooling-registration-id': null,
            },
          },
        },
      };
    });

    it('should return a 200 status after having successfully updated the password', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;
      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 status when schoolingRegistration does not exist', async function () {
      // given
      options.payload.data.attributes['schooling-registration-id'] = 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it("should return a 404 status when schoolingRegistration's userId does not exist", async function () {
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

    it('should return a 403 status when user does not belong to the same organization as schoolingRegistration', async function () {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const organizationLearnerWithWrongOrganization = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: wrongOrganization.id,
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['schooling-registration-id'] = organizationLearnerWithWrongOrganization.id;

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
