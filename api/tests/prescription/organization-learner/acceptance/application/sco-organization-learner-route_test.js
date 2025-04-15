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
  describe('POST /api/sco-organization-learners/external', function () {
    let organization;
    let campaign;
    let options;
    let organizationLearner;
    let server;

    beforeEach(async function () {
      // given
      server = await createServer();

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
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
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
});
