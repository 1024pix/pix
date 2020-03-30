const _ = require('lodash');

const { expect, databaseBuilder, catchErr } = require('../../../test-helper');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const schoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/schooling-registration-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const mailService = require('../../../../lib/domain/services/mail-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');

const {
  CampaignCodeError, NotFoundError, EntityValidationError, SchoolingRegistrationAlreadyLinkedToUserError
} = require('../../../../lib/domain/errors');

const createAndAssociateUserToSchoolingRegistration = require('../../../../lib/domain/usecases/create-and-associate-user-to-schooling-registration');

describe('Integration | UseCases | create-and-associate-user-to-schooling-registration', () => {

  let organizationId;
  let campaignCode;
  let schoolingRegistration;
  let userAttributes;

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // when
      const error = await catchErr(createAndAssociateUserToSchoolingRegistration)({ campaignCode: 'NOTEXIST', campaignRepository });

      // then
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no schoolingRegistration found', () => {

    beforeEach(async () => {
      campaignCode = databaseBuilder.factory.buildCampaign().code;
      await databaseBuilder.commit();
    });

    it('should throw a Not Found error', async () => {
      // given
      userAttributes = {
        firstName: 'firstname',
        lastName: 'lastname',
        birthdate: '2008-01-01'
      };

      // when
      const error = await catchErr(createAndAssociateUserToSchoolingRegistration)({
        campaignCode, userAttributes,
        campaignRepository, userReconciliationService, schoolingRegistrationRepository
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
    });
  });

  context('When one schoolingRegistration matched on names', () => {

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({
        organizationId
      }).code;

      await databaseBuilder.commit();
    });

    context('When association is already done', () => {

      it('should nor create nor associate schoolingRegistration', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId, userId
        });
        userAttributes = {
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
        };

        await databaseBuilder.commit();

        // when
        const error = await catchErr(createAndAssociateUserToSchoolingRegistration)({
          campaignCode, userAttributes,
          campaignRepository, schoolingRegistrationRepository, userRepository,
          userReconciliationService, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(SchoolingRegistrationAlreadyLinkedToUserError);
      });
    });

    context('When creation is with email', () => {

      beforeEach(async () => {
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId, userId: null
        });
        userAttributes = {
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          email: '',
          password: ''
        };

        await databaseBuilder.commit();
      });

      context('When a field is not valid', () => {

        it('should throw EntityValidationError', async () => {
          // given
          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [
              {
                attribute: 'email',
                message: 'Votre adresse e-mail n’est pas renseignée.'
              },
              {
                attribute: 'password',
                message: 'Votre mot de passe n’est pas renseigné.',
              },
            ]
          });

          // when
          const error = await catchErr(createAndAssociateUserToSchoolingRegistration)({
            campaignCode, userAttributes,
            campaignRepository, schoolingRegistrationRepository, userRepository,
            userReconciliationService
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is not available', () => {

        it('should throw EntityValidationError', async () => {
          // given
          const email = 'user@organization.org';
          databaseBuilder.factory.buildUser({
            email
          });
          userAttributes.email = email;
          userAttributes.password = 'Pix12345';

          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [{
              attribute: 'email',
              message: 'Cette adresse e-mail est déjà enregistrée, connectez-vous.'
            }]
          });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(createAndAssociateUserToSchoolingRegistration)({
            campaignCode, userAttributes,
            campaignRepository, schoolingRegistrationRepository, userRepository,
            userReconciliationService
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is available', () => {

        it('should create user and associate schoolingRegistration', async () => {
          // given
          const email = 'user@organization.org';
          const password = 'Pix12345';

          userAttributes.email = email;
          userAttributes.password = password;

          const expectedUser = {
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            email,
            username: null,
            cgu: false,
          };

          // when
          const result = await createAndAssociateUserToSchoolingRegistration({
            campaignCode, userAttributes,
            campaignRepository, schoolingRegistrationRepository, userRepository,
            userReconciliationService, encryptionService, mailService
          });

          // then
          expect(_.pick(result, ['firstName', 'lastName', 'email', 'username', 'cgu'])).to.deep.equal(expectedUser);
        });
      });
    });

    context('When creation is with username', () => {

      beforeEach(async () => {
        schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({
          organizationId, userId: null
        });
        userAttributes = {
          firstName: schoolingRegistration.firstName,
          lastName: schoolingRegistration.lastName,
          birthdate: schoolingRegistration.birthdate,
          withUsername: true,
          password: 'Pix12345'
        };

        await databaseBuilder.commit();
      });

      context('When username is not available', () => {

        it('should throw EntityValidationError', async () => {
          // given
          const username = 'abc.def0112';
          databaseBuilder.factory.buildUser({
            username
          });
          userAttributes.username = username;

          const expectedValidationError = new EntityValidationError({
            invalidAttributes: [{
              attribute: 'username',
              message: 'Cet identifiant n’est plus disponible, merci de recharger la page.'
            }]
          });

          await databaseBuilder.commit();

          // when
          const error = await catchErr(createAndAssociateUserToSchoolingRegistration)({
            campaignCode, userAttributes,
            campaignRepository, schoolingRegistrationRepository, userRepository,
            userReconciliationService
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When username is available', () => {

        it('should create user and associate schoolingRegistration', async () => {
          // given
          const username = schoolingRegistration.firstName.toLowerCase() + '.' + schoolingRegistration.lastName.toLowerCase() + '0112';
          userAttributes.username = username;

          const expectedUser = {
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            username,
            email: undefined,
            cgu: false,
          };

          // when
          const result = await createAndAssociateUserToSchoolingRegistration({
            campaignCode, userAttributes,
            campaignRepository, schoolingRegistrationRepository, userRepository,
            userReconciliationService, encryptionService, mailService
          });

          // then
          expect(_.pick(result, ['firstName', 'lastName', 'email', 'username', 'cgu'])).to.deep.equal(expectedUser);
        });
      });
    });
  });

});
