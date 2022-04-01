const { catchErr, databaseBuilder, expect, knex } = require('../../../test-helper');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userToCreateRepository = require('../../../../lib/infrastructure/repositories/user-to-create-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');

const obfuscationService = require('../../../../lib/domain/services/obfuscation-service');
const tokenService = require('../../../../lib/domain/services/token-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const userService = require('../../../../lib/domain/services/user-service');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

const {
  CampaignCodeError,
  NotFoundError,
  ObjectValidationError,
  SchoolingRegistrationAlreadyLinkedToUserError,
} = require('../../../../lib/domain/errors');

const createUserAndReconcileToSchoolingRegistrationByExternalUser = require('../../../../lib/domain/usecases/create-user-and-reconcile-to-schooling-registration-from-external-user');

describe('Integration | UseCases | create-user-and-reconcile-to-schooling-registration-from-external-user', function () {
  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // when
      const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
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
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
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
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
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
        const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
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

  context('When no schoolingRegistration is found', function () {
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
      const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
        birthdate,
        campaignCode,
        token,
        campaignRepository,
        tokenService,
        userReconciliationService,
        schoolingRegistrationRepository,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('There are no schooling registrations found');
    });
  });

  context('When a schoolingRegistration match the token data and birthdate', function () {
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
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
        firstName,
        lastName,
        organizationId,
      });
      schoolingRegistration.userId = undefined;
      await databaseBuilder.commit();

      const usersBefore = await knex('users');

      // when
      await createUserAndReconcileToSchoolingRegistrationByExternalUser({
        birthdate: schoolingRegistration.birthdate,
        campaignCode,
        campaignRepository,
        token,
        obfuscationService,
        tokenService,
        userReconciliationService,
        userService,
        authenticationMethodRepository,
        schoolingRegistrationRepository,
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
        it('should throw a SchoolingRegistrationAlreadyLinkedToUserError', async function () {
          // given
          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
            firstName,
            lastName,
            organizationId,
          });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(createUserAndReconcileToSchoolingRegistrationByExternalUser)({
            birthdate: schoolingRegistration.birthdate,
            campaignCode,
            token,
            obfuscationService,
            tokenService,
            userReconciliationService,
            campaignRepository,
            schoolingRegistrationRepository,
            userRepository,
          });

          // then
          expect(error).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
        });
      }
    );

    context(
      'When the external user is already reconciled by another account with samlId authentication method',
      function () {
        context('When reconciled in other organization', function () {
          it('should update existing account with the new samlId', async function () {
            // given
            const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
              firstName,
              lastName,
              organizationId,
              nationalStudentId: 'coucou',
            });
            const otherAccount = databaseBuilder.factory.buildUser({
              firstName: firstName,
              lastName: lastName,
              birthdate: schoolingRegistration.birthdate,
            });
            databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
              externalIdentifier: '12345678',
              userId: otherAccount.id,
            });

            const otherOrganization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
            databaseBuilder.factory.buildSchoolingRegistration({
              organizationId: otherOrganization.id,
              firstName: schoolingRegistration.firstName,
              lastName: schoolingRegistration.lastName,
              birthdate: schoolingRegistration.birthdate,
              nationalStudentId: schoolingRegistration.nationalStudentId,
              userId: otherAccount.id,
            });
            schoolingRegistration.userId = undefined;
            await databaseBuilder.commit();

            // when
            await createUserAndReconcileToSchoolingRegistrationByExternalUser({
              campaignCode,
              token,
              birthdate: schoolingRegistration.birthdate,
              obfuscationService,
              tokenService,
              userReconciliationService,
              authenticationMethodRepository,
              campaignRepository,
              schoolingRegistrationRepository,
              studentRepository,
              userRepository,
            });

            // then
            const schoolingRegistrationInDB = await knex('organization-learners').where({
              id: schoolingRegistration.id,
            });
            expect(schoolingRegistrationInDB[0].userId).to.equal(otherAccount.id);

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

            const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
              firstName,
              lastName,
              birthdate,
              organizationId,
              userId: otherAccount.id,
            });

            await databaseBuilder.commit();

            // when
            await createUserAndReconcileToSchoolingRegistrationByExternalUser({
              campaignCode,
              token,
              birthdate: schoolingRegistration.birthdate,
              obfuscationService,
              tokenService,
              userReconciliationService,
              authenticationMethodRepository,
              campaignRepository,
              schoolingRegistrationRepository,
              studentRepository,
              userRepository,
            });

            // then
            const schoolingRegistrationInDB = await knex('organization-learners').where({
              id: schoolingRegistration.id,
            });
            expect(schoolingRegistrationInDB[0].userId).to.equal(otherAccount.id);

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
        const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          firstName,
          lastName,
          organizationId,
        });
        schoolingRegistration.userId = undefined;
        const alreadyCreatedUser = databaseBuilder.factory.buildUser({ firstName, lastName });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          externalIdentifier: samlId,
          userId: alreadyCreatedUser.id,
        });
        await databaseBuilder.commit();
        const usersBefore = await knex('users');

        // when
        await createUserAndReconcileToSchoolingRegistrationByExternalUser({
          birthdate: schoolingRegistration.birthdate,
          campaignCode,
          token,
          obfuscationService,
          tokenService,
          userReconciliationService,
          campaignRepository,
          schoolingRegistrationRepository,
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
