const pick = require('lodash/pick');

const { catchErr, databaseBuilder, expect, knex } = require('../../../test-helper');

const authenticationMethodRepository = require('../../../../lib/infrastructure/repositories/authentication-method-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userToCreateRepository = require('../../../../lib/infrastructure/repositories/user-to-create-repository');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const mailService = require('../../../../lib/domain/services/mail-service');
const obfuscationService = require('../../../../lib/domain/services/obfuscation-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');
const userService = require('../../../../lib/domain/services/user-service');

const {
  CampaignCodeError,
  EntityValidationError,
  NotFoundError,
  SchoolingRegistrationAlreadyLinkedToUserError,
} = require('../../../../lib/domain/errors');

const createAndReconcileUserToSchoolingRegistration = require('../../../../lib/domain/usecases/create-and-reconcile-user-to-schooling-registration');

describe('Integration | UseCases | create-and-reconcile-user-to-schooling-registration', function () {
  const pickUserAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
  const locale = 'fr';

  let campaignCode;
  let organizationId;
  let password;
  let schoolingRegistration;
  let userAttributes;

  context('When there is no campaign with the given code', function () {
    it('should throw a campaign code error', async function () {
      // when
      const error = await catchErr(createAndReconcileUserToSchoolingRegistration)({
        campaignCode: 'NOTEXIST',
        locale,
        password,
        userAttributes,
        authenticationMethodRepository,
        campaignRepository,
        schoolingRegistrationRepository,
        userRepository,
        encryptionService,
        mailService,
        obfuscationService,
        userReconciliationService,
        userService,
      });

      // then
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration found', function () {
    beforeEach(async function () {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
    });

    it('should throw a Not Found error', async function () {
      // given
      userAttributes = {
        firstName: 'firstname',
        lastName: 'lastname',
        birthdate: '2008-01-01',
      };

      // when
      const error = await catchErr(createAndReconcileUserToSchoolingRegistration)({
        campaignCode,
        locale,
        password,
        userAttributes,
        authenticationMethodRepository,
        campaignRepository,
        schoolingRegistrationRepository,
        userRepository,
        encryptionService,
        mailService,
        obfuscationService,
        userReconciliationService,
        userService,
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('There are no schooling registrations found');
    });
  });

  context('When one schoolingRegistration matched on names', function () {
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({
        organizationId,
      }).code;

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('authentication-methods').delete();
    });

    context('When association is already done', function () {
      it('should nor create nor associate schoolingRegistration', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId,
          userId,
        });
        userAttributes = {
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
        };

        await databaseBuilder.commit();

        // when
        const error = await catchErr(createAndReconcileUserToSchoolingRegistration)({
          campaignCode,
          locale,
          password,
          userAttributes,
          authenticationMethodRepository,
          campaignRepository,
          schoolingRegistrationRepository,
          userRepository,
          encryptionService,
          mailService,
          obfuscationService,
          userReconciliationService,
          userService,
        });

        // then
        expect(error).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
      });
    });

    context('When creation is with email', function () {
      beforeEach(async function () {
        password = 'Password123';

        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId,
          userId: null,
        });
        userAttributes = {
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          email: '',
        };

        await databaseBuilder.commit();
      });

      context('When a field is not valid', function () {
        it('should throw EntityValidationError', async function () {
          // given
          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'email',
                message: 'EMPTY_EMAIL',
              },
              {
                attribute: 'password',
                message: 'Votre mot de passe n’est pas renseigné.',
              },
            ],
          });

          // when
          const error = await catchErr(createAndReconcileUserToSchoolingRegistration)({
            campaignCode,
            locale,
            password: '',
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            schoolingRegistrationRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is not available', function () {
        it('should throw EntityValidationError', async function () {
          // given
          const email = 'user@organization.org';
          databaseBuilder.factory.buildUser({
            email,
          });
          userAttributes.email = email;

          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'email',
                message: 'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
              },
            ],
          });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(createAndReconcileUserToSchoolingRegistration)({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            schoolingRegistrationRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is available', function () {
        it('should create user and associate schoolingRegistration', async function () {
          // given
          const email = 'user@organization.org';
          userAttributes.email = email;

          // when
          const result = await createAndReconcileUserToSchoolingRegistration({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            schoolingRegistrationRepository,
            userRepository,
            userToCreateRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(pick(result, pickUserAttributes)).to.deep.equal({
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            email,
            username: null,
            cgu: false,
          });
        });
      });
    });

    context('When creation is with username', function () {
      beforeEach(async function () {
        password = 'Password123';

        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId,
          userId: null,
        });
        userAttributes = {
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          withUsername: true,
        };

        await databaseBuilder.commit();
      });

      context('When username is not available', function () {
        it('should throw EntityValidationError', async function () {
          // given
          const username = 'abc.def0112';
          databaseBuilder.factory.buildUser({
            username,
          });
          userAttributes.username = username;

          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'username',
                message: 'Cet identifiant n’est plus disponible, merci de recharger la page.',
              },
            ],
          });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(createAndReconcileUserToSchoolingRegistration)({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            schoolingRegistrationRepository,
            userRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When username is available', function () {
        it('should create user and associate schoolingRegistration', async function () {
          // given
          const username =
            schoolingRegistration.firstName.toLowerCase() + '.' + schoolingRegistration.lastName.toLowerCase() + '0112';
          userAttributes.username = username;

          const expectedUser = {
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            username,
            email: undefined,
            cgu: false,
          };

          // when
          const result = await createAndReconcileUserToSchoolingRegistration({
            campaignCode,
            locale,
            password,
            userAttributes,
            authenticationMethodRepository,
            campaignRepository,
            schoolingRegistrationRepository,
            userRepository,
            userToCreateRepository,
            encryptionService,
            mailService,
            obfuscationService,
            userReconciliationService,
            userService,
          });

          // then
          expect(pick(result, pickUserAttributes)).to.deep.equal(expectedUser);
        });
      });
    });
  });
});
