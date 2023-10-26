import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';

import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as organizationLearnerRepository from '../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import * as userRepository from '../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as userLoginRepository from '../../../../src/shared/infrastructure/repositories/user-login-repository.js';
import * as userToCreateRepository from '../../../../lib/infrastructure/repositories/user-to-create-repository.js';
import * as studentRepository from '../../../../lib/infrastructure/repositories/student-repository.js';
import * as authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository.js';
import * as obfuscationService from '../../../../lib/domain/services/obfuscation-service.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import * as userReconciliationService from '../../../../lib/domain/services/user-reconciliation-service.js';
import * as userService from '../../../../lib/domain/services/user-service.js';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';

import {
  CampaignCodeError,
  NotFoundError,
  ObjectValidationError,
  OrganizationLearnerAlreadyLinkedToUserError,
} from '../../../../lib/domain/errors.js';

import { createUserAndReconcileToOrganizationLearnerFromExternalUser as createUserAndReconcileToOrganizationLearnerByExternalUser } from '../../../../lib/domain/usecases/create-user-and-reconcile-to-organization-learner-from-external-user.js';

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
        userLoginRepository,
        userToCreateRepository,
      });

      // then
      const usersAfter = await knex('users');
      expect(usersBefore.length + 1).to.equal(usersAfter.length);

      const authenticationMethodInDB = await knex('authentication-methods');
      const authenticationMethod = authenticationMethodInDB[0];
      expect(authenticationMethod.externalIdentifier).to.equal(samlId);
      expect(authenticationMethod.authenticationComplement).to.deep.equal({
        firstName: 'Julie',
        lastName: 'Dumoulin-Lemarchand',
      });
    });

    context('When the external user is already linked to another account', function () {
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
            userLoginRepository,
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
              userLoginRepository,
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
              userLoginRepository,
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
          userLoginRepository,
        });

        // then
        const usersAfter = await knex('users');
        expect(usersAfter.length).to.equal(usersBefore.length);
      });
    });
  });
});
