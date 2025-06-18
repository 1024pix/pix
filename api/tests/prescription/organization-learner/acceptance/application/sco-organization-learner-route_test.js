import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  generateIdTokenForExternalUser,
  knex,
} from '../../../../test-helper.js';

describe('Prescription | Organization Learner | Acceptance | Application | sco-organization-learner-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sco-organization-learners/external', function () {
    let organization;
    let options;
    let organizationLearner;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/external',
        headers: generateAuthenticatedUserRequestHeaders(),
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
      await databaseBuilder.commit();
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
            'organization-id': organization.id,
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
              'organization-id': organization.id,
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
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
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
              'organization-id': organization.id,
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
            identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
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
              'organization-id': organization.id,
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

  describe('POST /api/sco-organization-learners/dependent', function () {
    let organization;
    let organizationLearner;

    beforeEach(async function () {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId: 'salut',
      });
      await databaseBuilder.commit();
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
                'organization-id': organization.id,
                'redirection-url': 'https://pixapp/campaigns/ABCDEFGHI',
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
                'organization-id': organization.id,
                'redirection-url': 'https://pixapp/campaigns/ABCDEFGHI',
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
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
});
