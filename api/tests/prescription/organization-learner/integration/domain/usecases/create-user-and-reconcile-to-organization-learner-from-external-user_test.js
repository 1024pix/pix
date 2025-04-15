import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { RequestedApplication } from '../../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import {
  CampaignCodeError,
  NotFoundError,
  ObjectValidationError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../../../src/shared/domain/errors.js';
import { tokenService } from '../../../../../../src/shared/domain/services/token-service.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | UseCases | create-user-and-reconcile-to-organization-learner-from-external-user', function () {
  let audience, requestedApplication;

  beforeEach(async function () {
    audience = 'https://app.pix.fr';
    requestedApplication = new RequestedApplication('app');
  });

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // when
      const error = await catchErr(usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser)({
        campaignCode: 'NOTEXIST',
      });

      // then
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When the token is invalid', function () {
    let campaignCode;

    beforeEach(async function () {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
    });

    context('When the firstName is empty', function () {
      it('should throw an ObjectValidationError', async function () {
        // given
        const externalUser = {
          lastName: 'Jackson',
          samlId: 'samlId',
        };
        const token = tokenService.createIdTokenForUserReconciliation(externalUser);

        // when
        const error = await catchErr(usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser)({
          campaignCode,
          token,
          tokenService,
        });

        // then
        expect(error).to.be.instanceof(ObjectValidationError);
        expect(error.message).to.eq('Missing claim(s) in IdToken');
      });
    });

    context('When the lastName is empty', function () {
      it('should throw an ObjectValidationError', async function () {
        // given
        const externalUser = {
          firstName: 'Saml',
          samlId: 'samlId',
        };
        const token = tokenService.createIdTokenForUserReconciliation(externalUser);

        // when
        const error = await catchErr(usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser)({
          campaignCode,
          token,
          tokenService,
        });

        // then
        expect(error).to.be.instanceof(ObjectValidationError);
        expect(error.message).to.eq('Missing claim(s) in IdToken');
      });
    });

    context('When the samlId is empty', function () {
      it('should throw an ObjectValidationError', async function () {
        // given
        const externalUser = {
          firstName: 'Saml',
          lastName: 'Jackson',
        };
        const token = tokenService.createIdTokenForUserReconciliation(externalUser);

        // when
        const error = await catchErr(usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser)({
          campaignCode,
          token,
        });

        // then
        expect(error).to.be.instanceof(ObjectValidationError);
        expect(error.message).to.eq('Missing claim(s) in IdToken');
      });
    });
  });

  context('When no organizationLearner is found', function () {
    let campaignCode;
    let token;

    beforeEach(async function () {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
      const externalUser = {
        firstName: 'Saml',
        lastName: 'Jackson',
        samlId: 'samlId',
      };
      token = tokenService.createIdTokenForUserReconciliation(externalUser);
    });

    it('should throw a Not Found error', async function () {
      // given
      const birthdate = '2008-01-01';

      // when
      const error = await catchErr(usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser)({
        birthdate,
        campaignCode,
        token,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('Found no organization learners matching organization and birthdate');
    });
  });

  context('When an organizationLearner matches on birthdate and on token firstName and lastName', function () {
    const firstName = 'Julie';
    const lastName = 'Dumoulin-Lemarchand';
    const samlId = 'SamlId';

    let campaignCode;
    let organizationId;
    let token;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId }).code;
      await databaseBuilder.commit();

      const externalUser = { firstName, lastName, samlId };
      token = tokenService.createIdTokenForUserReconciliation(externalUser);
    });

    it('creates the external user, reconciles it and creates GAR authentication method', async function () {
      // given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        firstName,
        lastName,
        organizationId,
      });
      organizationLearner.userId = undefined;
      await databaseBuilder.commit();

      const usersBefore = await knex('users');

      // when
      await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
        birthdate: organizationLearner.birthdate,
        campaignCode,
        token,
        tokenService,
        audience,
        requestedApplication,
      });

      // then
      const usersAfter = await knex('users');
      expect(usersBefore.length + 1).to.equal(usersAfter.length);

      const authenticationMethodInDB = await knex('authentication-methods');
      const authenticationMethod = authenticationMethodInDB[0];
      const lastUserApplicationConnections = await knex('last-user-application-connections');
      const lastUserApplicationConnection = lastUserApplicationConnections[0];
      expect(authenticationMethod.externalIdentifier).to.equal(samlId);
      expect(authenticationMethod.authenticationComplement).to.deep.equal({
        firstName: 'Julie',
        lastName: 'Dumoulin-Lemarchand',
      });
      expect(authenticationMethod.identityProvider).to.equal(NON_OIDC_IDENTITY_PROVIDERS.GAR.code);
      expect(lastUserApplicationConnection.userId).to.equal(authenticationMethod.userId);
      expect(lastUserApplicationConnection.application).to.equal(requestedApplication.applicationName);
    });

    context('When the external user is already reconciled to another account', function () {
      context('without samlId authentication method', function () {
        it('throws an OrganizationLearnerAlreadyLinkedToUserError', async function () {
          // given
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            firstName,
            lastName,
            organizationId,
          });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser)({
            birthdate: organizationLearner.birthdate,
            campaignCode,
            token,
          });

          // then
          expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
        });
      });

      context('with samlId authentication method', function () {
        context('When reconciled in other organization', function () {
          it('updates existing account with the new samlId, firstName and lastName', async function () {
            // given
            const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              firstName,
              lastName,
              organizationId,
              nationalStudentId: 'coucou',
            });
            const otherAccount = databaseBuilder.factory.buildUser({
              firstName: firstName,
              lastName: lastName,
              birthdate: organizationLearner.birthdate,
            });
            databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
              externalIdentifier: '12345678',
              userId: otherAccount.id,
              firstName: 'Juliette',
              lastName: 'Dumoulin',
            });

            const otherOrganization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
            databaseBuilder.factory.buildOrganizationLearner({
              organizationId: otherOrganization.id,
              firstName: organizationLearner.firstName,
              lastName: organizationLearner.lastName,
              birthdate: organizationLearner.birthdate,
              nationalStudentId: organizationLearner.nationalStudentId,
              userId: otherAccount.id,
            });
            organizationLearner.userId = undefined;
            await databaseBuilder.commit();

            // when
            await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
              campaignCode,
              token,
              birthdate: organizationLearner.birthdate,
              audience,
              requestedApplication,
            });

            // then
            const organizationLearnerInDB = await knex('organization-learners').where({
              id: organizationLearner.id,
            });
            expect(organizationLearnerInDB[0].userId).to.equal(otherAccount.id);

            const authenticationMethodInDB = await knex('authentication-methods').where({
              identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
              userId: otherAccount.id,
            });
            const authenticationMethod = authenticationMethodInDB[0];
            expect(authenticationMethod.externalIdentifier).to.equal(samlId);
            expect(authenticationMethod.authenticationComplement).to.deep.equal({
              firstName: 'Julie',
              lastName: 'Dumoulin-Lemarchand',
            });
          });
        });

        context('When reconciled in the same organization', function () {
          it('updates existing account with the new samlId, firstName and lastName', async function () {
            // given
            const birthdate = '10-10-2010';
            const otherAccount = databaseBuilder.factory.buildUser({
              firstName: firstName,
              lastName: lastName,
              birthdate: birthdate,
            });
            databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
              externalIdentifier: '12345678',
              userId: otherAccount.id,
              firstName: 'Juliette',
              lastName: 'Dumoulin',
            });

            const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
              firstName,
              lastName,
              birthdate,
              organizationId,
              userId: otherAccount.id,
            });

            await databaseBuilder.commit();

            // when
            await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
              campaignCode,
              token,
              birthdate: organizationLearner.birthdate,
              audience,
              requestedApplication,
            });

            // then
            const organizationLearnerInDB = await knex('organization-learners').where({
              id: organizationLearner.id,
            });
            expect(organizationLearnerInDB[0].userId).to.equal(otherAccount.id);

            const authenticationMethodInDB = await knex('authentication-methods').where({
              identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
              userId: otherAccount.id,
            });
            const authenticationMethod = authenticationMethodInDB[0];
            const lastUserApplicationConnections = await knex('last-user-application-connections');
            const lastUserApplicationConnection = lastUserApplicationConnections[0];
            expect(authenticationMethod.externalIdentifier).to.equal(samlId);
            expect(authenticationMethod.authenticationComplement).to.deep.equal({
              firstName: 'Julie',
              lastName: 'Dumoulin-Lemarchand',
            });
            expect(authenticationMethod.identityProvider).to.equal(NON_OIDC_IDENTITY_PROVIDERS.GAR.code);
            expect(lastUserApplicationConnection.userId).to.equal(authenticationMethod.userId);
            expect(lastUserApplicationConnection.application).to.equal(requestedApplication.applicationName);
          });
        });
      });
    });

    context('When the external user is already created', function () {
      it('does not create again the user', async function () {
        // given
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          firstName,
          lastName,
          organizationId,
        });
        organizationLearner.userId = undefined;
        const alreadyCreatedUser = databaseBuilder.factory.buildUser({ firstName, lastName });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: samlId,
          userId: alreadyCreatedUser.id,
        });
        await databaseBuilder.commit();
        const usersBefore = await knex('users');

        // when
        await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
          birthdate: organizationLearner.birthdate,
          campaignCode,
          token,
          audience,
          requestedApplication,
        });

        // then
        const usersAfter = await knex('users');
        expect(usersAfter).to.have.lengthOf(usersBefore.length);
      });
    });
  });
});
