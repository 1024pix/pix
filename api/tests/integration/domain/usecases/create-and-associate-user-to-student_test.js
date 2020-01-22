const _ = require('lodash');

const { expect, databaseBuilder, catchErr } = require('../../../test-helper');

const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const studentRepository = require('../../../../lib/infrastructure/repositories/student-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const mailService = require('../../../../lib/domain/services/mail-service');
const userReconciliationService = require('../../../../lib/domain/services/user-reconciliation-service');

const {
  CampaignCodeError, NotFoundError, EntityValidationError, OrganizationStudentAlreadyLinkedToUserError
} = require('../../../../lib/domain/errors');

const createAndAssociateUserToStudent = require('../../../../lib/domain/usecases/create-and-associate-user-to-student');

describe('Integration | UseCases | create-and-associate-user-to-student', () => {

  let organizationId;
  let campaignCode;
  let student;
  let userAttributes;

  context('When there is no campaign with the given code', () => {

    it('should throw a campaign code error', async () => {
      // when
      const error = await catchErr(createAndAssociateUserToStudent)({ campaignCode: 'NOTEXIST', campaignRepository });

      // then
      expect(error).to.be.instanceof(CampaignCodeError);
    });
  });

  context('When no student found', () => {

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
      const error = await catchErr(createAndAssociateUserToStudent)({
        campaignCode, userAttributes,
        campaignRepository, userReconciliationService, studentRepository
      });

      // then
      expect(error).to.be.instanceof(NotFoundError);
      expect(error.message).to.equal('There were no students matching with organization and birthdate');
    });
  });

  context('When one student matched on names', () => {

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignCode = databaseBuilder.factory.buildCampaign({
        organizationId
      }).code;

      await databaseBuilder.commit();
    });

    context('When association is already done', () => {

      it('should nor create nor associate student', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        student = databaseBuilder.factory.buildStudent({
          organizationId, userId
        });
        userAttributes = {
          firstName: student.firstName,
          lastName: student.lastName,
          birthdate: student.birthdate,
        };

        await databaseBuilder.commit();

        // when
        const error = await catchErr(createAndAssociateUserToStudent)({
          campaignCode, userAttributes,
          campaignRepository, studentRepository, userRepository,
          userReconciliationService, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(OrganizationStudentAlreadyLinkedToUserError);
      });
    });

    context('When creation is with email', () => {

      beforeEach(async () => {
        student = databaseBuilder.factory.buildStudent({
          organizationId, userId: null
        });
        userAttributes = {
          firstName: student.firstName,
          lastName: student.lastName,
          birthdate: student.birthdate,
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
          const error = await catchErr(createAndAssociateUserToStudent)({
            campaignCode, userAttributes,
            campaignRepository, studentRepository, userRepository,
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
          const error = await catchErr(createAndAssociateUserToStudent)({
            campaignCode, userAttributes,
            campaignRepository, studentRepository, userRepository,
            userReconciliationService
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When email is available', () => {

        it('should create user and associate student', async () => {
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
          const result = await createAndAssociateUserToStudent({
            campaignCode, userAttributes,
            campaignRepository, studentRepository, userRepository,
            userReconciliationService, encryptionService, mailService
          });

          // then
          expect(_.pick(result, ['firstName', 'lastName', 'email', 'username', 'cgu'])).to.deep.equal(expectedUser);
        });
      });
    });

    context('When creation is with username', () => {

      beforeEach(async () => {
        student = databaseBuilder.factory.buildStudent({
          organizationId, userId: null
        });
        userAttributes = {
          firstName: student.firstName,
          lastName: student.lastName,
          birthdate: student.birthdate,
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
          const error = await catchErr(createAndAssociateUserToStudent)({
            campaignCode, userAttributes,
            campaignRepository, studentRepository, userRepository,
            userReconciliationService
          });

          // then
          expect(error).to.be.instanceOf(EntityValidationError);
          expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
        });
      });

      context('When username is available', () => {

        it('should create user and associate student', async () => {
          // given
          const username = student.firstName.toLowerCase() + '.' + student.lastName.toLowerCase() + '0112';
          userAttributes.username = username;

          const expectedUser = {
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            username,
            email: undefined,
            cgu: false,
          };

          // when
          const result = await createAndAssociateUserToStudent({
            campaignCode, userAttributes,
            campaignRepository, studentRepository, userRepository,
            userReconciliationService, encryptionService, mailService
          });

          // then
          expect(_.pick(result, ['firstName', 'lastName', 'email', 'username', 'cgu'])).to.deep.equal(expectedUser);
        });
      });
    });
  });

});
