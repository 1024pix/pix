import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper';
import campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository';
import organizationLearnerRepository from '../../../../lib/infrastructure/repositories/organization-learner-repository';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';
import userToCreateRepository from '../../../../lib/infrastructure/repositories/user-to-create-repository';
import studentRepository from '../../../../lib/infrastructure/repositories/student-repository';
import authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository';
import obfuscationService from '../../../../lib/domain/services/obfuscation-service';
import tokenService from '../../../../lib/domain/services/token-service';
import userReconciliationService from '../../../../lib/domain/services/user-reconciliation-service';
import userService from '../../../../lib/domain/services/user-service';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';

import {
  CampaignCodeError,
  NotFoundError,
  ObjectValidationError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../lib/domain/errors';

import createUserAndReconcileToOrganizationLearnerByExternalUser from '../../../../lib/domain/usecases/create-user-and-reconcile-to-organization-learner-from-external-user';

describe('Integration | UseCases | create-user-and-reconcile-to-organization-learner-from-external-user', function () {
  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // when
      const error = await catchErr(createUserAndReconcileToOrganizationLearnerByExternalUser)({
        campaignCode: 'NOTEXIST',
        campaignRepository,
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
        const error = await catchErr(createUserAndReconcileToOrganizationLearnerByExternalUser)({
          campaignCode,
          token,
          tokenService,
          campaignRepository,
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
        const error = await catchErr(createUserAndReconcileToOrganizationLearnerByExternalUser)({
          campaignCode,
          token,
          tokenService,
          campaignRepository,
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
        const error = await catchErr(createUserAndReconcileToOrganizationLearnerByExternalUser)({
          campaignCode,
          token,
          tokenService,
          campaignRepository,
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
      const error = await catchErr(createUserAndReconcileToOrganizationLearnerByExternalUser)({
        birthdate,
        campaignCode,
        token,
        campaignRepository,
        tokenService,
        userReconciliationService,
        organizationLearnerRepository,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('There are no organization learners found');
    });
  });

  context('When an organizationLearner match the token data and birthdate', function () {
    const firstName = 'Saml';
    const lastName = 'Jackson';
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

    afterEach(async function () {
      await knex('authentication-methods').delete();
      await knex('organization-learners').delete();
      await knex('campaigns').delete();
      await knex('users').delete();
    });

    it('should create the external user, reconcile it and create GAR authentication method', async function () {
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
      await createUserAndReconcileToOrganizationLearnerByExternalUser({
        birthdate: organizationLearner.birthdate,
        campaignCode,
        campaignRepository,
        token,
        obfuscationService,
        tokenService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        organizationLearnerRepository,
        studentRepository,
        userRepository,
        userToCreateRepository,
      });

      // then
      const usersAfter = await knex('users');
      expect(usersBefore.length + 1).to.equal(usersAfter.length);

      const authenticationMethodInDB = await knex('authentication-methods');
      expect(authenticationMethodInDB[0].externalIdentifier).to.equal(samlId);
    });

    context(
      'When the external user is already reconciled by another account without samlId authentication method',
      function () {
        it('should throw a OrganizationLearnerAlreadyLinkedToUserError', async function () {
          // given
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            firstName,
            lastName,
            organizationId,
          });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(createUserAndReconcileToOrganizationLearnerByExternalUser)({
            birthdate: organizationLearner.birthdate,
            campaignCode,
            token,
            obfuscationService,
            tokenService,
            userReconciliationService,
            campaignRepository,
            organizationLearnerRepository,
            userRepository,
          });

          // then
          expect(error).to.be.instanceOf(OrganizationLearnerAlreadyLinkedToUserError);
        });
      }
    );

    context(
      'When the external user is already reconciled by another account with samlId authentication method',
      function () {
        context('When reconciled in other organization', function () {
          it('should update existing account with the new samlId', async function () {
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
            await createUserAndReconcileToOrganizationLearnerByExternalUser({
              campaignCode,
              token,
              birthdate: organizationLearner.birthdate,
              obfuscationService,
              tokenService,
              userReconciliationService,
              authenticationMethodRepository,
              campaignRepository,
              organizationLearnerRepository,
              studentRepository,
              userRepository,
            });

            // then
            const organizationLearnerInDB = await knex('organization-learners').where({
              id: organizationLearner.id,
            });
            expect(organizationLearnerInDB[0].userId).to.equal(otherAccount.id);

            const authenticationMethodInDB = await knex('authentication-methods').where({
              identityProvider: AuthenticationMethod.identityProviders.GAR,
              userId: otherAccount.id,
            });
            expect(authenticationMethodInDB[0].externalIdentifier).to.equal(samlId);
          });
        });

        context('When reconciled in the same organization', function () {
          it('should update existing account with the new samlId', async function () {
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
            await createUserAndReconcileToOrganizationLearnerByExternalUser({
              campaignCode,
              token,
              birthdate: organizationLearner.birthdate,
              obfuscationService,
              tokenService,
              userReconciliationService,
              authenticationMethodRepository,
              campaignRepository,
              organizationLearnerRepository,
              studentRepository,
              userRepository,
            });

            // then
            const organizationLearnerInDB = await knex('organization-learners').where({
              id: organizationLearner.id,
            });
            expect(organizationLearnerInDB[0].userId).to.equal(otherAccount.id);

            const authenticationMethodInDB = await knex('authentication-methods').where({
              identityProvider: AuthenticationMethod.identityProviders.GAR,
              userId: otherAccount.id,
            });
            expect(authenticationMethodInDB[0].externalIdentifier).to.equal(samlId);
          });
        });
      }
    );

    context('When the external user is already created', function () {
      it('should not create again the user', async function () {
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
        await createUserAndReconcileToOrganizationLearnerByExternalUser({
          birthdate: organizationLearner.birthdate,
          campaignCode,
          token,
          obfuscationService,
          tokenService,
          userReconciliationService,
          campaignRepository,
          organizationLearnerRepository,
          studentRepository,
          userRepository,
        });

        // then
        const usersAfter = await knex('users');
        expect(usersAfter.length).to.equal(usersBefore.length);
      });
    });
  });
});
