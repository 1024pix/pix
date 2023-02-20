import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  generateIdTokenForExternalUser,
} from '../../../test-helper';

import createServer from '../../../../server';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';

describe('Acceptance | Controller | sco-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sco-organization-learners/association', function () {
    let organization;
    let campaign;
    let options;
    let organizationLearner;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/association',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'france',
        lastName: 'gall',
        birthdate: '2001-01-01',
        organizationId: organization.id,
        userId: null,
        nationalStudentId: 'francegall123',
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    context('associate user with firstName, lastName and birthdate', function () {
      it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': organizationLearner.firstName,
            'last-name': organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          },
        };
        options.url += '?withReconciliation=true';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('when user is not authenticated', function () {
        it('should respond with a 401 - unauthorized access', async function () {
          // given
          options.headers.authorization = 'invalid.access.token';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('When withReconciliation query param is set to false', function () {
        it('should not reconcile user and return a 204 No Content', async function () {
          // given
          options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          };
          options.url += '?withReconciliation=false';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const organizationLearnerInDB = await knex('organization-learners')
            .where({
              firstName: organizationLearner.firstName,
              lastName: organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            })
            .select();
          expect(organizationLearnerInDB.userId).to.be.undefined;
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/association/auto', function () {
    const nationalStudentId = '12345678AZ';
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/association/auto',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId,
      });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, nationalStudentId });
      await databaseBuilder.commit();

      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
        },
        type: 'sco-organization-learners',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is not authenticated', function () {
      it('should respond with a 401 - unauthorized access', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('PUT /api/sco-organization-learners/possibilities', function () {
    it('should return the organizationLearner linked to the user and a 200 status code response', async function () {
      //given
      const organization = databaseBuilder.factory.buildOrganization({
        isManagingStudents: true,
        type: 'SCO',
      });
      const campaignCode = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
      }).code;
      const user = databaseBuilder.factory.buildUser();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: null,
        nationalStudentId: 'nsi123ABC',
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: '/api/sco-organization-learners/possibilities',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': organizationLearner.firstName,
              'last-name': organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          attributes: {
            birthdate: '2005-08-05',
            'first-name': 'Billy',
            'last-name': 'TheKid',
            username: 'billy.thekid0508',
          },
          type: 'sco-organization-learners',
        },
      });
    });
  });

  describe('POST /api/sco-organization-learners/dependent', function () {
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

    afterEach(async function () {
      await knex('authentication-methods').delete();
    });

    context('when creation is with email', function () {
      it('should return an 204 status after having successfully created user and associated user to organizationLearner', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/sco-organization-learners/dependent',
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
    });

    context('when creation is with username', function () {
      it('should return a 204 status after having successfully created user and associated user to organizationLearner', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/sco-organization-learners/dependent',
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
    });
  });

  describe('POST /api/sco-organization-learners/external', function () {
    let organization;
    let campaign;
    let options;
    let organizationLearner;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/external',
        headers: {},
        payload: {},
      };

      organization = databaseBuilder.factory.buildOrganization({ identityProvider: 'SCO' });
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'josé',
        lastName: 'bové',
        birthdate: '2020-01-01',
        nationalStudentId: 'josébové123',
        organizationId: organization.id,
        userId: null,
      });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();
    });

    afterEach(function () {
      return knex('authentication-methods').delete();
    });

    context('when an external user try to reconcile for the first time', function () {
      it('should return an 200 status after having successfully created the user and associated it to organizationLearner', async function () {
        // given
        const externalUser = {
          lastName: organizationLearner.lastName,
          firstName: organizationLearner.firstName,
          samlId: '123456789',
        };
        const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'external-user-token': idTokenForExternalUser,
            birthdate: organizationLearner.birthdate,
            'access-token': null,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When external user is already reconciled', function () {
        it('should replace the existing user samlId already reconciled in the other organization with the authenticated user samlId', async function () {
          // given
          const user = databaseBuilder.factory.buildUser({
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
          });
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: user.id,
          });

          const otherOrganization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: otherOrganization.id,
            firstName: organizationLearner.firstName,
            lastName: organizationLearner.lastName,
            birthdate: organizationLearner.birthdate,
            nationalStudentId: organizationLearner.nationalStudentId,
            userId: user.id,
          });
          await databaseBuilder.commit();

          const externalUser = {
            lastName: organizationLearner.lastName,
            firstName: organizationLearner.firstName,
            samlId: '9876654321',
          };
          const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': idTokenForExternalUser,
              birthdate: organizationLearner.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.payload).to.contains('access-token');
          const result = await knex('authentication-methods').where({
            userId: user.id,
            identityProvider: AuthenticationMethod.identityProviders.GAR,
          });
          const garAuthenticationMethod = result[0];
          expect(garAuthenticationMethod.externalIdentifier).to.equal(externalUser.samlId);
        });

        it('should replace the existing user samlId already reconciled in the same organization found with the authenticated user samlId', async function () {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
            externalIdentifier: '12345678',
            userId: userWithSamlIdOnly.id,
          });

          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            userId: userWithSamlIdOnly.id,
            firstName: userWithSamlIdOnly.firstName,
            lastName: userWithSamlIdOnly.lastName,
            birthdate: userWithSamlIdOnly.birthdate,
          });
          await databaseBuilder.commit();

          const externalUser = {
            lastName: organizationLearner.lastName,
            firstName: organizationLearner.firstName,
            samlId: '9876654321',
          };
          const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': idTokenForExternalUser,
              birthdate: organizationLearner.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.payload).to.contains('access-token');
          const result = await knex('authentication-methods').where({
            userId: userWithSamlIdOnly.id,
            identityProvider: AuthenticationMethod.identityProviders.GAR,
          });
          const garAuthenticationMethod = result[0];
          expect(garAuthenticationMethod.externalIdentifier).to.equal(externalUser.samlId);
        });
      });

      context('when external user id token is not valid', function () {
        it('should respond with a 401 - unauthorized access', async function () {
          // given
          const invalidIdToken = 'invalid.id.token';

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': invalidIdToken,
              birthdate: organizationLearner.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/password-update', function () {
    it('should return a 200 status after having successfully updated the password', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        userId,
      }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/sco-organization-learners/password-update',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'organization-learner-id': organizationLearnerId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sco-organization-learners/username-password-generation', function () {
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
        url: '/api/sco-organization-learners/username-password-generation',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'organization-learner-id': organizationLearnerId,
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

    it('should return a 403 status when student does not belong to the same organization as organizationLearner', async function () {
      // given
      options.payload.data.attributes['organization-id'] = organizationId + 1;
      options.payload.data.attributes['organization-learner-id'] = organizationLearnerId;

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

      options.payload.data.attributes['organization-learner-id'] = organizationLearnerWithWrongOrganization.id;
      options.payload.data.attributes['organization-id'] = wrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/sco-organization-learners/account-recovery', function () {
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
        url: '/api/sco-organization-learners/account-recovery',
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
